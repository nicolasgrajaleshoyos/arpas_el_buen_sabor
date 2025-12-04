@extends('layouts.app')

@section('title', 'Recursos Humanos - Arepas el Buen Sabor')

@section('content')
<div id="hr-content"></div>
@endsection

@push('scripts')
<script src="{{ asset('js/modules/hr.js') }}"></script>
<script>
    document.addEventListener('DOMContentLoaded', function() {
        document.getElementById('hr-content').innerHTML = HR.render();
        HR.init();
    });
</script>
@endpush
