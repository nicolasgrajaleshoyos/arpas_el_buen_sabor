@extends('layouts.app')

@section('title', 'Créditos - Arepas el Buen Sabor')

@section('content')
<div id="credits-content"></div>
@endsection

@push('scripts')
<script src="{{ asset('js/modules/credits.js') }}?v=1.5"></script>
<script>
    document.addEventListener('DOMContentLoaded', function() {
        document.getElementById('credits-content').innerHTML = Credits.render();
        Credits.init();
    });
</script>
@endpush
