import 'package:flutter/material.dart';
import 'package:mobile_frontend/data/repo/laravel/laravel_preference_api_repository.dart';

class UserPreferenceProvider extends ChangeNotifier {
  // store selections as sets of indices per question
  final List<Set<int>> _selected = List.generate(5, (_) => {});

  List<Set<int>> get selected => _selected;

  /// Toggle selection for [page]/[idx].
  /// Returns true if selection state changed, false if no change (e.g. exceeded max).
  bool toggle(int page, int idx, {int max = 3}) {
    if (_selected[page].contains(idx)) {
      _selected[page].remove(idx);
      notifyListeners();
      return true;
    }

    if (max == 1) {
      _selected[page].clear();
      _selected[page].add(idx);
      notifyListeners();
      return true;
    }

    if (_selected[page].length < max) {
      _selected[page].add(idx);
      notifyListeners();
      return true;
    }

    // hit max, no change
    return false;
  }

  void clearAll() {
    for (var s in _selected) {
      s.clear();
    }
    notifyListeners();
  }

  /// Clear selections for a single page/question and notify listeners.
  void clearPage(int page) {
    if (page < 0 || page >= _selected.length) return;
    _selected[page].clear();
    notifyListeners();
  }

  Future<Map<String, dynamic>> submit(Map<String, List<String>> payload) async {
    final repo = LaravelPreferenceApiRepository();
    return await repo.submitPreferences(payload);
  }
}
