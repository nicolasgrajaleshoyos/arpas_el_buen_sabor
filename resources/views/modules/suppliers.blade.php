@extends('layouts.app')

@section('title', 'Proveedores - Arepas el Buen Sabor')

@section('content')
<div id="suppliers-content"></div>
@endsection

@push('scripts')
<script src="{{ asset('js/modules/suppliers.js') }}?v=2.3"></script>
<script>
    document.addEventListener('DOMContentLoaded', function() {
        document.getElementById('suppliers-content').innerHTML = Suppliers.render();
        Suppliers.init();
    });
</script>
@endpush
