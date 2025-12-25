"""
Collaborative Filtering (CF) Recommender Module

This module implements collaborative filtering using:
- TensorFlow/Keras with embedding layers
- RecommenderNet class (similar to book recommendation example)
- User and place embeddings
"""

import pandas as pd
import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
import pickle
import os


class RecommenderNet(keras.Model):
    """
    RecommenderNet class for collaborative filtering.
    
    Similar to the book recommendation example, this class uses:
    - User embeddings
    - Place embeddings
    - Bias terms
    - Dot product for similarity
    - Sigmoid activation for binary classification
    """
    
    def __init__(self, num_users, num_places, embedding_size, dropout_rate=0.2, **kwargs):
        """
        Initialize RecommenderNet.
        
        Args:
            num_users: Number of unique users
            num_places: Number of unique places
            embedding_size: Size of embedding vectors
            dropout_rate: Dropout rate for regularization
        """
        super(RecommenderNet, self).__init__(**kwargs)
        self.num_users = num_users
        self.num_places = num_places
        self.embedding_size = embedding_size
        self.dropout_rate = dropout_rate
        
        # User embedding layer
        self.user_embedding = layers.Embedding(
            num_users,
            embedding_size,
            embeddings_initializer='he_normal',
            embeddings_regularizer=keras.regularizers.l2(1e-6)
        )
        self.user_bias = layers.Embedding(num_users, 1)
        
        # Place embedding layer
        self.place_embedding = layers.Embedding(
            num_places,
            embedding_size,
            embeddings_initializer='he_normal',
            embeddings_regularizer=keras.regularizers.l2(1e-6)
        )
        self.place_bias = layers.Embedding(num_places, 1)
        
        # Dropout layer
        self.dropout = layers.Dropout(rate=dropout_rate)
    
    def call(self, inputs):
        """
        Forward pass.
        
        Args:
            inputs: Tensor of shape [batch_size, 2] where columns are [user_id, place_id]
            
        Returns:
            Predicted rating scores (0-1 range)
        """
        user_vector = self.user_embedding(inputs[:, 0])
        user_vector = self.dropout(user_vector)
        user_bias = self.user_bias(inputs[:, 0])
        
        place_vector = self.place_embedding(inputs[:, 1])
        place_vector = self.dropout(place_vector)
        place_bias = self.place_bias(inputs[:, 1])
        
        # Dot product multiplication
        dot_user_place = tf.tensordot(user_vector, place_vector, 2)
        
        # Add biases
        x = dot_user_place + user_bias + place_bias
        
        # Sigmoid activation
        return tf.nn.sigmoid(x)


class CFRecommender:
    """
    Collaborative Filtering Recommender
    
    Uses RecommenderNet to predict user-place ratings.
    """
    
    def __init__(self):
        self.model = None
        self.user_to_index = {}
        self.place_to_index = {}
        self.index_to_user = {}
        self.index_to_place = {}
        self.num_users = 0
        self.num_places = 0
        self.places_df = None
        
    def prepare_data(self, ratings_df, places_df):
        """
        Prepare data for training.
        
        Args:
            ratings_df: DataFrame with columns: user_id, place_id, rating
            places_df: DataFrame with places data
        """
        self.places_df = places_df.copy()
        
        # Create mappings
        unique_users = sorted(ratings_df['user_id'].unique())
        unique_places = sorted(ratings_df['place_id'].unique())
        
        self.user_to_index = {user: idx for idx, user in enumerate(unique_users)}
        self.place_to_index = {place: idx for idx, place in enumerate(unique_places)}
        self.index_to_user = {idx: user for user, idx in self.user_to_index.items()}
        self.index_to_place = {idx: place for place, idx in self.place_to_index.items()}
        
        self.num_users = len(unique_users)
        self.num_places = len(unique_places)
        
        # Encode ratings
        ratings_df = ratings_df.copy()
        ratings_df['user_encoded'] = ratings_df['user_id'].map(self.user_to_index)
        ratings_df['place_encoded'] = ratings_df['place_id'].map(self.place_to_index)
        
        return ratings_df
    
    def train(self, ratings_df, places_df, embedding_size=50, epochs=50, batch_size=16, validation_split=0.1):
        """
        Train the CF model.
        
        Args:
            ratings_df: DataFrame with columns: user_id, place_id, rating
            places_df: DataFrame with places data
            embedding_size: Size of embedding vectors
            epochs: Number of training epochs
            batch_size: Batch size for training
            validation_split: Fraction of data to use for validation
            
        Returns:
            Training history
        """
        # Prepare data
        ratings_df = self.prepare_data(ratings_df, places_df)
        
        # Prepare input and output
        x = ratings_df[['user_encoded', 'place_encoded']].values
        y = ratings_df['rating'].values
        
        # Normalize ratings to 0-1 (already should be, but ensure)
        min_rating = y.min()
        max_rating = y.max()
        if max_rating > min_rating:
            y = (y - min_rating) / (max_rating - min_rating)
        
        # Shuffle data
        indices = np.arange(len(x))
        np.random.shuffle(indices)
        x = x[indices]
        y = y[indices]
        
        # Split train/validation
        train_indices = int((1 - validation_split) * len(x))
        x_train, x_val = x[:train_indices], x[train_indices:]
        y_train, y_val = y[:train_indices], y[train_indices:]
        
        # Create model
        self.model = RecommenderNet(self.num_users, self.num_places, embedding_size)
        
        # Compile model
        self.model.compile(
            loss=keras.losses.BinaryCrossentropy(),
            optimizer=keras.optimizers.Adam(learning_rate=1e-4),
            metrics=[keras.metrics.RootMeanSquaredError()]
        )
        
        # Train model
        history = self.model.fit(
            x=x_train,
            y=y_train,
            batch_size=batch_size,
            epochs=epochs,
            validation_data=(x_val, y_val)
        )
        
        return history
    
    def predict_ratings(self, user_id, place_ids):
        """
        Predict ratings for a user and list of places.
        
        Args:
            user_id: User ID
            place_ids: List of place IDs
            
        Returns:
            Array of predicted ratings
        """
        if self.model is None:
            raise ValueError("Model not trained. Call train() first.")
        
        if user_id not in self.user_to_index:
            # New user - return default ratings
            return np.array([0.5] * len(place_ids))
        
        user_encoded = self.user_to_index[user_id]
        
        # Encode places
        place_encodings = []
        valid_place_ids = []
        for place_id in place_ids:
            if place_id in self.place_to_index:
                place_encodings.append(self.place_to_index[place_id])
                valid_place_ids.append(place_id)
            else:
                # Unknown place - skip
                continue
        
        if len(place_encodings) == 0:
            return np.array([])
        
        # Prepare input
        x = np.array([[user_encoded, place_enc] for place_enc in place_encodings])
        
        # Predict
        predictions = self.model.predict(x, verbose=0).flatten()
        
        # Create result array for all places
        result = np.full(len(place_ids), 0.5)  # Default rating
        result_dict = dict(zip(valid_place_ids, predictions))
        for i, place_id in enumerate(place_ids):
            if place_id in result_dict:
                result[i] = result_dict[place_id]
        
        return result
    
    def recommend_places(self, user_id, places_df, k=10, exclude_rated=True):
        """
        Get top-k recommendations for a user.
        
        Args:
            user_id: User ID
            places_df: DataFrame with places to recommend from
            k: Number of recommendations
            exclude_rated: Whether to exclude places user has already rated
            
        Returns:
            DataFrame with recommended places and predicted ratings
        """
        if self.model is None:
            raise ValueError("Model not trained. Call train() first.")
        
        # Get all place IDs
        place_ids = places_df['placeID'].unique().tolist()
        
        # Predict ratings
        predicted_ratings = self.predict_ratings(user_id, place_ids)
        
        # Create recommendations DataFrame
        recommendations = pd.DataFrame({
            'placeID': place_ids,
            'predicted_rating': predicted_ratings
        })
        
        # Merge with place details
        recommendations = recommendations.merge(places_df, on='placeID', how='left')
        
        # Sort by predicted rating
        recommendations = recommendations.sort_values('predicted_rating', ascending=False)
        
        # Return top k
        return recommendations.head(k)
    
    def save_model(self, filepath='models/cf_model'):
        """
        Save the trained model to disk.
        
        Args:
            filepath: Directory path to save the model
        """
        os.makedirs(filepath, exist_ok=True)
        
        # Save Keras model (using modern .keras format)
        self.model.save(os.path.join(filepath, 'model.keras'))
        
        # Save mappings
        mappings = {
            'user_to_index': self.user_to_index,
            'place_to_index': self.place_to_index,
            'index_to_user': self.index_to_user,
            'index_to_place': self.index_to_place,
            'num_users': self.num_users,
            'num_places': self.num_places
        }
        
        with open(os.path.join(filepath, 'mappings.pkl'), 'wb') as f:
            pickle.dump(mappings, f)
    
    def load_model(self, filepath='models/cf_model'):
        """
        Load a trained model from disk.
        
        Args:
            filepath: Directory path to load the model from
            
        Raises:
            ValueError: If model file is corrupted or missing
            FileNotFoundError: If model files don't exist
        """
        mappings_path = os.path.join(filepath, 'mappings.pkl')
        
        # Try to find model file - prefer .keras format, fallback to .h5
        model_keras_path = os.path.join(filepath, 'model.keras')
        model_h5_path = os.path.join(filepath, 'model.h5')
        
        model_path = None
        if os.path.exists(model_keras_path):
            model_path = model_keras_path
        elif os.path.exists(model_h5_path):
            model_path = model_h5_path
        else:
            raise FileNotFoundError(
                f"Model file not found. Expected either {model_keras_path} or {model_h5_path}"
            )
        
        if not os.path.exists(mappings_path):
            raise FileNotFoundError(f"Mappings file not found: {mappings_path}")
        
        # Check file size (model should be reasonably large)
        file_size = os.path.getsize(model_path)
        if file_size < 1000:  # Less than 1KB is suspicious
            raise ValueError(
                f"Model file appears corrupted (too small: {file_size} bytes). "
                f"Please retrain the model."
            )
        
        try:
            # Load Keras model with custom objects to ensure RecommenderNet is available
            # This is required because RecommenderNet is a custom class
            self.model = keras.models.load_model(
                model_path,
                custom_objects={'RecommenderNet': RecommenderNet}
            )
        except Exception as e:
            raise ValueError(
                f"Failed to load model from {model_path}: {str(e)}. "
                f"The model file may be corrupted. Please retrain the model."
            )
        
        # Load mappings
        try:
            with open(mappings_path, 'rb') as f:
                mappings = pickle.load(f)
        except Exception as e:
            raise ValueError(f"Failed to load mappings from {mappings_path}: {str(e)}")
        
        self.user_to_index = mappings['user_to_index']
        self.place_to_index = mappings['place_to_index']
        self.num_users = mappings['num_users']
        self.num_places = mappings['num_places']
        
        # Create reverse mappings if they don't exist (for backward compatibility)
        # Old models might not have saved these
        if 'index_to_user' in mappings:
            self.index_to_user = mappings['index_to_user']
        else:
            # Generate reverse mapping from forward mapping
            self.index_to_user = {idx: user for user, idx in self.user_to_index.items()}
        
        if 'index_to_place' in mappings:
            self.index_to_place = mappings['index_to_place']
        else:
            # Generate reverse mapping from forward mapping
            self.index_to_place = {idx: place for place, idx in self.place_to_index.items()}


if __name__ == "__main__":
    # Test the CF recommender
    from .data_loader import load_places_dataset, preprocess_places_data, generate_synthetic_ratings
    
    print("Loading data...")
    places_df = load_places_dataset()
    places_df = preprocess_places_data(places_df)
    
    print("Generating synthetic ratings...")
    ratings_df = generate_synthetic_ratings(places_df, num_users=1000)
    
    print(f"Generated {len(ratings_df)} ratings for {ratings_df['user_id'].nunique()} users")
    
    print("\nTraining CF model...")
    cf = CFRecommender()
    history = cf.train(ratings_df, places_df, epochs=5, batch_size=16)  # Small epochs for testing
    
    print("Model trained successfully!")
    print(f"Number of users: {cf.num_users}")
    print(f"Number of places: {cf.num_places}")





