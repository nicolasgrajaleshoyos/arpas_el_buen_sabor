@extends('layouts.app')

@section('content')
    <div id="returns-content">
        <!-- Content will be rendered by JS -->
        <div class="flex justify-center items-center h-64">
            <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
    </div>
@endsection

@push('scripts')
<script src="{{ asset('js/modules/returns.js') }}?v=2.4"></script>
<script>
    document.addEventListener('DOMContentLoaded', function() {
        if (typeof Returns !== 'undefined') {
            document.getElementById('returns-content').innerHTML = Returns.render();
            Returns.init();
        }
    });
</script>
@endpush
