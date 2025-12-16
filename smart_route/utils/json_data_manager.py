"""
JSON Data Loader - Fast MVP Implementation
100% FREE - No database needed for demo
"""
import json
import os
from typing import List, Dict, Optional
from pathlib import Path


class JSONDataManager:
    """
    Manage JSON data files for MVP
    FAST - Perfect for 1-week deadline
    
    Data Structure:
    data/
      ├── pois/          → POI information
      ├── users/         → User preferences
      ├── routes/        → Saved routes
      ├── traffic/       → Traffic conditions
      └── comparison/    → Algorithm comparison results
    """
    
    def __init__(self, data_dir: str = "./data"):
        self.data_dir = Path(data_dir)
        self.ensure_directories()
    
    def ensure_directories(self):
        """Create data directories if they don't exist"""
        dirs = ['pois', 'users', 'routes', 'traffic', 'comparison']
        for dir_name in dirs:
            (self.data_dir / dir_name).mkdir(parents=True, exist_ok=True)
    
    # ==================== POI Management ====================
    
    def load_pois(self, city: str = "bangkok") -> List[Dict]:
        """
        Load POIs from JSON file
        FAST - No database query needed
        
        Returns:
            List of POI dictionaries
        """
        file_path = self.data_dir / "pois" / f"{city}_pois.json"
        
        if not file_path.exists():
            return []
        
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        return data.get('pois', [])
    
    def get_poi_by_id(self, poi_id: int, city: str = "bangkok") -> Optional[Dict]:
        """Get single POI by ID"""
        pois = self.load_pois(city)
        for poi in pois:
            if poi['id'] == poi_id:
                return poi
        return None
    
    def get_pois_by_category(self, category: str, city: str = "bangkok") -> List[Dict]:
        """Filter POIs by category"""
        pois = self.load_pois(city)
        return [poi for poi in pois if poi.get('category') == category]
    
    def add_poi(self, poi: Dict, city: str = "bangkok"):
        """Add new POI to JSON file"""
        file_path = self.data_dir / "pois" / f"{city}_pois.json"
        
        # Load existing
        if file_path.exists():
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
        else:
            data = {'pois': [], 'metadata': {}}
        
        # Add new POI
        data['pois'].append(poi)
        data['metadata']['total_pois'] = len(data['pois'])
        data['metadata']['last_updated'] = self._get_timestamp()
        
        # Save
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
    
    # ==================== User Management ====================
    
    def load_user_preferences(self, user_id: int) -> Optional[Dict]:
        """
        Load user preferences
        FAST - Direct JSON access
        """
        file_path = self.data_dir / "users" / "user_preferences.json"
        
        if not file_path.exists():
            return None
        
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        users = data.get('users', [])
        for user in users:
            if user['user_id'] == user_id:
                return user
        
        return None
    
    def save_user_preferences(self, user: Dict):
        """Save or update user preferences"""
        file_path = self.data_dir / "users" / "user_preferences.json"
        
        # Load existing
        if file_path.exists():
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
        else:
            data = {'users': [], 'metadata': {}}
        
        # Update or add user
        users = data['users']
        user_exists = False
        for i, existing_user in enumerate(users):
            if existing_user['user_id'] == user['user_id']:
                users[i] = user
                user_exists = True
                break
        
        if not user_exists:
            users.append(user)
        
        data['metadata']['total_users'] = len(users)
        data['metadata']['last_updated'] = self._get_timestamp()
        
        # Save
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
    
    # ==================== Traffic Management ====================
    
    def load_traffic_conditions(self) -> List[Dict]:
        """
        Load current traffic conditions
        FAST - For dynamic re-optimization
        """
        file_path = self.data_dir / "traffic" / "current_traffic.json"
        
        if not file_path.exists():
            return []
        
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        return data.get('traffic_conditions', [])
    
    def get_traffic_factor(self, from_poi: int, to_poi: int) -> float:
        """
        Get traffic factor between two POIs
        1.0 = normal, 1.5 = 50% slower, 2.0 = 100% slower
        """
        conditions = self.load_traffic_conditions()
        
        for condition in conditions:
            if (condition['from_poi_id'] == from_poi and 
                condition['to_poi_id'] == to_poi):
                return condition.get('traffic_factor', 1.0)
        
        return 1.0  # Default: no traffic
    
    def update_traffic(self, from_poi: int, to_poi: int, factor: float):
        """Update traffic condition (for simulation)"""
        file_path = self.data_dir / "traffic" / "current_traffic.json"
        
        # Load existing
        if file_path.exists():
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
        else:
            data = {'traffic_conditions': [], 'metadata': {}}
        
        conditions = data['traffic_conditions']
        
        # Update or add condition
        found = False
        for condition in conditions:
            if (condition['from_poi_id'] == from_poi and 
                condition['to_poi_id'] == to_poi):
                condition['traffic_factor'] = factor
                condition['last_updated'] = self._get_timestamp()
                found = True
                break
        
        if not found:
            conditions.append({
                'from_poi_id': from_poi,
                'to_poi_id': to_poi,
                'traffic_factor': factor,
                'last_updated': self._get_timestamp()
            })
        
        data['metadata']['last_updated'] = self._get_timestamp()
        
        # Save
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
    
    # ==================== Route Management ====================
    
    def save_route(
        self,
        user_id: int,
        route: List[int],
        algorithm: str,
        metrics: Dict,
        route_type: str = "classical"
    ) -> str:
        """
        Save optimized route
        Returns: route_id
        """
        import uuid
        route_id = str(uuid.uuid4())
        
        route_data = {
            'route_id': route_id,
            'user_id': user_id,
            'algorithm': algorithm,
            'route_type': route_type,
            'poi_sequence': route,
            'metrics': metrics,
            'created_at': self._get_timestamp()
        }
        
        # Save to user-specific file
        file_path = self.data_dir / "routes" / f"user_{user_id}_routes.json"
        
        if file_path.exists():
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
        else:
            data = {'routes': []}
        
        data['routes'].append(route_data)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        return route_id
    
    def load_user_routes(self, user_id: int) -> List[Dict]:
        """Load all routes for a user"""
        file_path = self.data_dir / "routes" / f"user_{user_id}_routes.json"
        
        if not file_path.exists():
            return []
        
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        return data.get('routes', [])
    
    # ==================== Comparison Results ====================
    
    def save_comparison(
        self,
        comparison_id: str,
        algorithms: List[str],
        results: Dict,
        pois: List[Dict]
    ):
        """
        Save algorithm comparison results
        For teacher presentation
        """
        file_path = self.data_dir / "comparison" / f"{comparison_id}.json"
        
        comparison_data = {
            'comparison_id': comparison_id,
            'algorithms': algorithms,
            'results': results,
            'pois': pois,
            'created_at': self._get_timestamp()
        }
        
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(comparison_data, f, indent=2, ensure_ascii=False)
    
    def load_comparison(self, comparison_id: str) -> Optional[Dict]:
        """Load comparison results"""
        file_path = self.data_dir / "comparison" / f"{comparison_id}.json"
        
        if not file_path.exists():
            return None
        
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    # ==================== Helper Methods ====================
    
    def _get_timestamp(self) -> str:
        """Get current timestamp in ISO format"""
        from datetime import datetime
        return datetime.utcnow().isoformat() + 'Z'
    
    def export_all_data(self, output_file: str):
        """Export all data to single JSON file (for backup)"""
        all_data = {
            'pois': {},
            'users': {},
            'routes': {},
            'traffic': {},
            'comparison': {}
        }
        
        # Load all POI files
        for poi_file in (self.data_dir / 'pois').glob('*.json'):
            city_name = poi_file.stem.replace('_pois', '')
            with open(poi_file, 'r', encoding='utf-8') as f:
                all_data['pois'][city_name] = json.load(f)
        
        # Load users
        user_file = self.data_dir / 'users' / 'user_preferences.json'
        if user_file.exists():
            with open(user_file, 'r', encoding='utf-8') as f:
                all_data['users'] = json.load(f)
        
        # Load traffic
        traffic_file = self.data_dir / 'traffic' / 'current_traffic.json'
        if traffic_file.exists():
            with open(traffic_file, 'r', encoding='utf-8') as f:
                all_data['traffic'] = json.load(f)
        
        # Save export
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(all_data, f, indent=2, ensure_ascii=False)
        
        print(f"✓ All data exported to: {output_file}")


# Example usage (FAST MVP)
if __name__ == "__main__":
    # Initialize data manager
    manager = JSONDataManager()
    
    # Load POIs (NO DATABASE!)
    print("Loading POIs from JSON...")
    pois = manager.load_pois("bangkok")
    print(f"✓ Loaded {len(pois)} POIs")
    
    # Load user preferences
    print("\nLoading user preferences...")
    user = manager.load_user_preferences(1)
    if user:
        print(f"✓ User: {user['name']}")
        print(f"  Preferences: {user['preferences']}")
    
    # Check traffic
    print("\nLoading traffic conditions...")
    traffic = manager.load_traffic_conditions()
    print(f"✓ Loaded {len(traffic)} traffic conditions")
    
    # Get traffic factor
    factor = manager.get_traffic_factor(1, 2)
    print(f"  Traffic factor POI 1→2: {factor}x")
    
    print("\n✓ JSON Data Manager ready - NO DATABASE NEEDED!")
    print("✓ Perfect for 1-week MVP deadline!")
