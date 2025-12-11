@extends('layouts.app')

@section('title', 'Ventas - Arepas el Buen Sabor')

@section('content')
<div id="sales-content"></div>
@endsection

@push('scripts')
<script src="{{ asset('js/modules/sales.js') }}?v=3.4"></script>
<script>
    document.addEventListener('DOMContentLoaded', function() {
        document.getElementById('sales-content').innerHTML = Sales.render();
        Sales.init();
    });
</script>
@endpush
