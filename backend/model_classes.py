import pandas as pd
from mlxtend.frequent_patterns import apriori, association_rules

class SimilarProductModel:
    def __init__(self, df, cosine_matrix):
        self.df = df.reset_index(drop=True)
        self.cosine = cosine_matrix
        
    def predict(self, product_name, top_n=10):
        idx = self.df.index[self.df['product_name'].str.lower() == product_name.lower()].tolist()
        if not idx:
            return []
        
        idx = idx[0]
        sim_scores = list(enumerate(self.cosine[idx]))
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
        
        top_products = sim_scores[1:top_n+1]
        product_idx = [i[0] for i in top_products]
        
        result = self.df.loc[product_idx, [
            'product_id', 'product_name', 'category', 'brand',
            'price', 'rating', 'features'
        ]].copy()
        
        result['similarity_score'] = [i[1] for i in top_products]
        return result.reset_index(drop=True)


class FrequentBoughtModel:
    def __init__(self, data):
        self.data = data
        
        data_filtered = data[data['products_name'].apply(lambda x: len(x) > 1)]
        
        all_products = sorted(list({p for sublist in data_filtered['products_name'] for p in sublist}))
        
        basket = pd.DataFrame(False, index=data_filtered['transaction_id'], columns=all_products)
        for idx, row in data_filtered.iterrows():
            for p in row['products_name']:
                basket.loc[row['transaction_id'], p] = True
        
        basket = basket.loc[:, (basket.sum(axis=0) >= 3)]
        
        frequent_itemsets = apriori(basket, min_support=0.001, use_colnames=True)
        
        if frequent_itemsets.empty:
            self.rules = pd.DataFrame()
            return
        
        rules = association_rules(frequent_itemsets, metric="lift", min_threshold=1.0)
        self.rules = rules
        
    def predict(self, product_name, top_n=5):
        """
        Returns a list of dicts, each with:
          - product_name : str   (consequent product name from association rules)
          - confidence   : float (how often the rule is correct)
          - lift         : float (how much better than random chance)
        Returns [] if no rules match or rules are empty.
        """
        if self.rules.empty:
            return []

        product_lower = product_name.lower().strip()

        rules_filtered = self.rules[
            self.rules['antecedents'].apply(
                lambda x: any(
                    str(item).lower().strip() == product_lower
                    for item in x
                )
            )
        ]

        if rules_filtered.empty:
            return []

        # Sort by lift descending so the most meaningful associations come first
        rules_filtered = rules_filtered.sort_values("lift", ascending=False)

        results = []
        for _, row in rules_filtered.head(top_n).iterrows():
            consequents = list(row['consequents'])
            if not consequents:
                continue
            results.append({
                "product_name": str(consequents[0]),
                "confidence": round(float(row['confidence']), 4),
                "lift": round(float(row['lift']), 4),
            })

        return results