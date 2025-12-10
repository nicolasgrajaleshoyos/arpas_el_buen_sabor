@extends('layouts.app')

@section('title', 'Materia Prima - Arepas el Buen Sabor')

@section('content')
<div id="raw-materials-content"></div>
@endsection

@push('scripts')
<script src="{{ asset('js/modules/rawMaterials.js') }}?v=4.3"></script>
<script>
    document.addEventListener('DOMContentLoaded', function() {
        document.getElementById('raw-materials-content').innerHTML = RawMaterials.render();
        RawMaterials.init();
    });
</script>
@endpush
