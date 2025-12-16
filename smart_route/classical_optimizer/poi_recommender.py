"""
POI Recommender using FREE collaborative filtering
No paid ML services required
"""
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from typing import List, Dict, Tuple


class POIRecommender:
    """
    Recommends Points of Interest based on user preferences
    Uses collaborative filtering (user-based similarity)
    100% FREE - scikit-learn only
    """
    
    def __init__(self):
        self.user_item_matrix = None
        self.poi_features = None
        
    def recommend_pois(
        self, 
        user_id: int, 
        user_preferences: Dict[str, float],
        candidate_pois: List[Dict],
        max_pois: int = 10
    ) -> List[Dict]:
        """
        Recommend POIs based on user preferences
        
        Args:
            user_id: User identifier
            user_preferences: {category: weight, ...} e.g., {'temple': 0.9, 'beach': 0.7}
            candidate_pois: List of POI dictionaries from database
            max_pois: Maximum POIs to recommend
            
        Returns:
            List of recommended POIs with scores
        """
        scored_pois = []
        
        for poi in candidate_pois:
            score = self._calculate_poi_score(poi, user_preferences)
            scored_pois.append({
                **poi,
                'recommendation_score': score
            })
        
        # Sort by score descending
        scored_pois.sort(key=lambda x: x['recommendation_score'], reverse=True)
        
        return scored_pois[:max_pois]
    
    def _calculate_poi_score(
        self, 
        poi: Dict, 
        user_preferences: Dict[str, float]
    ) -> float:
        """
        Calculate recommendation score for a POI
        
        Scoring factors (all FREE):
        - Category match with user preferences
        - POI rating (from )
        - Popularity (visit count)
        - User's past visits to similar POIs
        """
        score = 0.0
        
        # Category preference match (weight: 0.4)
        poi_category = poi.get('category', '').lower()
        if poi_category in user_preferences:
            score += user_preferences[poi_category] * 0.4
        
        # POI rating (weight: 0.3)
        poi_rating = poi.get('rating', 0) / 5.0  # Normalize to 0-1
        score += poi_rating * 0.3
        
        # Popularity (weight: 0.2)
        visit_count = poi.get('visit_count', 0)
        popularity = min(visit_count / 1000, 1.0)  # Normalize
        score += popularity * 0.2
        
        # Opening hours compatibility (weight: 0.1)
        is_open = poi.get('is_open_now', True)
        score += 0.1 if is_open else 0.0
        
        return score
    
    def collaborative_filtering(
        self,
        user_id: int,
        user_item_matrix: np.ndarray,
        poi_ids: List[int],
        k_neighbors: int = 5
    ) -> Dict[int, float]:
        """
        FREE collaborative filtering using cosine similarity
        
        Args:
            user_id: Current user
            user_item_matrix: Matrix of user ratings (users × POIs)
            poi_ids: List of POI IDs
            k_neighbors: Number of similar users to consider
            
        Returns:
            Dictionary {poi_id: predicted_rating}
        """
        # Find similar users (FREE cosine similarity)
        user_vector = user_item_matrix[user_id].reshape(1, -1)
        similarities = cosine_similarity(user_vector, user_item_matrix)[0]
        
        # Get top-k similar users (excluding self)
        similar_indices = np.argsort(similarities)[::-1][1:k_neighbors+1]
        
        # Predict ratings for unvisited POIs
        predictions = {}
        for poi_idx, poi_id in enumerate(poi_ids):
            if user_item_matrix[user_id, poi_idx] == 0:  # Unvisited
                # Weighted average of similar users' ratings
                similar_ratings = user_item_matrix[similar_indices, poi_idx]
                similar_weights = similarities[similar_indices]
                
                if similar_weights.sum() > 0:
                    predicted_rating = np.average(
                        similar_ratings, 
                        weights=similar_weights
                    )
                    predictions[poi_id] = predicted_rating
        
        return predictions
    
    def content_based_filtering(
        self,
        user_preferences: Dict[str, float],
        pois: List[Dict]
    ) -> List[Tuple[Dict, float]]:
        """
        FREE content-based filtering
        Match POI features with user preference vector
        
        Args:
            user_preferences: User preference weights
            pois: List of POI dictionaries
            
        Returns:
            List of (poi, similarity_score) tuples
        """
        results = []
        
        # Extract user preference vector
        categories = list(user_preferences.keys())
        user_vector = np.array([user_preferences[cat] for cat in categories])
        
        for poi in pois:
            # Create POI feature vector
            poi_vector = np.zeros(len(categories))
            poi_category = poi.get('category', '').lower()
            
            if poi_category in categories:
                idx = categories.index(poi_category)
                poi_vector[idx] = 1.0
                
                # Boost by rating
                poi_vector[idx] *= (poi.get('rating', 3) / 5.0)
            
            # Calculate cosine similarity (FREE)
            similarity = cosine_similarity(
                user_vector.reshape(1, -1),
                poi_vector.reshape(1, -1)
            )[0][0]
            
            results.append((poi, similarity))
        
        # Sort by similarity descending
        results.sort(key=lambda x: x[1], reverse=True)
        
        return results
    
    def hybrid_recommend(
        self,
        user_id: int,
        user_preferences: Dict[str, float],
        pois: List[Dict],
        user_item_matrix: np.ndarray = None,
        poi_ids: List[int] = None,
        max_results: int = 10
    ) -> List[Dict]:
        """
        Hybrid recommendation combining collaborative + content-based
        100% FREE approach
        
        Args:
            user_id: User identifier
            user_preferences: Category preferences
            pois: Candidate POIs
            user_item_matrix: Optional matrix for collaborative filtering
            poi_ids: Optional POI IDs matching matrix columns
            max_results: Maximum POIs to return
            
        Returns:
            List of recommended POIs with hybrid scores
        """
        # Content-based scores (always available)
        content_scores = {
            poi['id']: score 
            for poi, score in self.content_based_filtering(user_preferences, pois)
        }
        
        # Collaborative scores (if matrix available)
        collab_scores = {}
        if user_item_matrix is not None and poi_ids is not None:
            collab_scores = self.collaborative_filtering(
                user_id, user_item_matrix, poi_ids
            )
        
        # Combine scores (hybrid)
        hybrid_scores = []
        for poi in pois:
            poi_id = poi['id']
            
            # Weighted combination (60% content, 40% collaborative)
            content_score = content_scores.get(poi_id, 0.0)
            collab_score = collab_scores.get(poi_id, content_score)  # Fallback
            
            hybrid_score = 0.6 * content_score + 0.4 * collab_score
            
            hybrid_scores.append({
                **poi,
                'recommendation_score': hybrid_score,
                'content_score': content_score,
                'collaborative_score': collab_score
            })
        
        # Sort and return top results
        hybrid_scores.sort(key=lambda x: x['recommendation_score'], reverse=True)
        return hybrid_scores[:max_results]
    
    def recommend_for_quantum(
        self,
        user_preferences: Dict[str, float],
        candidate_pois: List[Dict],
        start_location: Tuple[float, float],
        start_time: int = 540,  # 9 AM default
        trip_duration: int = 480,  # 8 hours default
        max_distance_km: float = 10.0,
        exact_count: int = 4
    ) -> List[Dict]:
        """
        Recommend exactly N POIs for quantum QAOA optimization
        Uses content-based filtering with spatial and temporal constraints
        
        Args:
            user_preferences: Category preferences {category: weight}
            candidate_pois: All available POIs
            start_location: (lat, lon) of user's starting point
            start_time: Trip start time in minutes since midnight (540 = 9 AM)
            trip_duration: Maximum trip duration in minutes
            max_distance_km: Maximum distance from start location
            exact_count: Exact number of POIs to return (default: 4 for QAOA)
            
        Returns:
            List of exactly exact_count POIs with normalized scores [0, 1]
            Each POI includes 'recommendation_score' normalized to [0, 1]
        """
        from utils.distance_calculator import DistanceCalculator
        
        distance_calc = DistanceCalculator()
        start_lat, start_lon = start_location
        end_time = start_time + trip_duration
        
        # Step 1: Filter by spatial constraints
        nearby_pois = []
        for poi in candidate_pois:
            poi_lat = poi.get('lat', 0)
            poi_lon = poi.get('lng', 0)
            
            distance = distance_calc.haversine_distance(
                start_lat, start_lon, poi_lat, poi_lon
            )
            
            if distance <= max_distance_km:
                nearby_pois.append({
                    **poi,
                    'distance_from_start': distance
                })
        
        if len(nearby_pois) == 0:
            # Fallback: return closest POIs regardless of distance
            all_with_distance = []
            for poi in candidate_pois:
                poi_lat = poi.get('lat', 0)
                poi_lon = poi.get('lng', 0)
                distance = distance_calc.haversine_distance(
                    start_lat, start_lon, poi_lat, poi_lon
                )
                all_with_distance.append({
                    **poi,
                    'distance_from_start': distance
                })
            all_with_distance.sort(key=lambda x: x['distance_from_start'])
            nearby_pois = all_with_distance[:exact_count * 2]
        
        # Step 2: Filter by temporal constraints (opening hours)
        time_compatible_pois = []
        for poi in nearby_pois:
            opening_time = poi.get('opening_time', 0)
            closing_time = poi.get('closing_time', 1440)  # Midnight
            visit_duration = poi.get('visit_duration', 60)
            
            # Check if POI can be visited during trip window
            # Simplified: POI should be open during the trip window
            if opening_time < end_time and closing_time > start_time:
                time_compatible_pois.append(poi)
        
        # Fallback if too few POIs pass temporal filter
        if len(time_compatible_pois) < exact_count:
            time_compatible_pois = nearby_pois
        
        # Step 3: Content-based scoring
        scored_pois = []
        for poi in time_compatible_pois:
            # Category match score
            poi_category = poi.get('category', '').lower()
            category_score = user_preferences.get(poi_category, 0.0)
            
            # Distance penalty (closer is better)
            distance_score = max(0, 1.0 - poi['distance_from_start'] / max_distance_km)
            
            # Rating score (if available)
            rating_score = poi.get('rating', 3.0) / 5.0
            
            # Combined score (weighted)
            combined_score = (
                0.5 * category_score +      # 50% category preference
                0.3 * distance_score +       # 30% proximity
                0.2 * rating_score          # 20% rating
            )
            
            scored_pois.append({
                **poi,
                'recommendation_score': combined_score
            })
        
        # Step 4: Sort and select top POIs
        scored_pois.sort(key=lambda x: x['recommendation_score'], reverse=True)
        
        # Step 5: Ensure exactly exact_count POIs
        if len(scored_pois) < exact_count:
            # Pad with lower-scored POIs from all candidates if needed
            remaining_pois = [p for p in candidate_pois 
                            if p['id'] not in [sp['id'] for sp in scored_pois]]
            for poi in remaining_pois[:exact_count - len(scored_pois)]:
                scored_pois.append({
                    **poi,
                    'recommendation_score': 0.1,  # Low score for padding
                    'distance_from_start': distance_calc.haversine_distance(
                        start_lat, start_lon, 
                        poi.get('lat', 0), poi.get('lng', 0)
                    )
                })
        
        selected_pois = scored_pois[:exact_count]
        
        # Step 6: Normalize scores to [0, 1] range for QUBO encoding
        if len(selected_pois) > 0:
            max_score = max(p['recommendation_score'] for p in selected_pois)
            min_score = min(p['recommendation_score'] for p in selected_pois)
            score_range = max_score - min_score if max_score > min_score else 1.0
            
            for poi in selected_pois:
                poi['normalized_score'] = (
                    (poi['recommendation_score'] - min_score) / score_range
                ) if score_range > 0 else 0.5
                # Ensure minimum score of 0.1 for QUBO encoding
                poi['normalized_score'] = max(0.1, poi['normalized_score'])
        
        return selected_pois


# Example usage (FREE)
if __name__ == "__main__":
    recommender = POIRecommender()
    
    # Example user preferences
    user_prefs = {
        'temple': 0.9,
        'beach': 0.7,
        'museum': 0.5,
        'restaurant': 0.8
    }
    
    # Example POIs from database
    sample_pois = [
        {'id': 1, 'name': 'Wat Arun', 'category': 'temple', 'rating': 4.5, 'visit_count': 5000},
        {'id': 2, 'name': 'Patong Beach', 'category': 'beach', 'rating': 4.2, 'visit_count': 8000},
        {'id': 3, 'name': 'National Museum', 'category': 'museum', 'rating': 4.0, 'visit_count': 2000},
        {'id': 4, 'name': 'Thai Restaurant', 'category': 'restaurant', 'rating': 4.7, 'visit_count': 3000},
    ]
    
    # Get recommendations (FREE)
    recommendations = recommender.recommend_pois(
        user_id=1,
        user_preferences=user_prefs,
        candidate_pois=sample_pois,
        max_pois=3
    )
    
    print("Recommended POIs:")
    for poi in recommendations:
        print(f"- {poi['name']}: {poi['recommendation_score']:.2f}")
