@extends('layouts.app')

@section('title', 'Inventario - Arepas el Buen Sabor')

@section('content')
<div id="inventory-content"></div>
@endsection

@push('scripts')
<script src="{{ asset('js/modules/inventory.js') }}?v=2.3"></script>
<script>
    document.addEventListener('DOMContentLoaded', function() {
        document.getElementById('inventory-content').innerHTML = Inventory.render();
        Inventory.init();
    });
</script>
@endpush
