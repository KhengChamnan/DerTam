enum AsyncValueState { loading, error, success, empty }

class AsyncValue<T> {
  final T? data;
  final Object? error;
  final AsyncValueState state;

  AsyncValue._({this.data, this.error, required this.state});

  factory AsyncValue.loading() => AsyncValue._(state: AsyncValueState.loading);

  factory AsyncValue.success(T data) =>
      AsyncValue._(data: data, state: AsyncValueState.success);

  factory AsyncValue.error(Object error) =>
      AsyncValue._(error: error, state: AsyncValueState.error);

  factory AsyncValue.empty() => AsyncValue._(state: AsyncValueState.empty);

  R when<R>({
    required R Function() empty,
    required R Function() loading,
    required R Function(Object error) error,
    required R Function(T data) success,
  }) {
    switch (state) {
      case AsyncValueState.empty:
        return empty();
      case AsyncValueState.loading:
        return loading();
      case AsyncValueState.error:
        return error(this.error!);
      case AsyncValueState.success:
        return success(data as T);
    }
  }
}
