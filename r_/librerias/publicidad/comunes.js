/*
Funciones comunes de usuario
*/
//var currAgno = new Date();
//currAgno = currAgno.getFullYear();

$().ready(function(){
	//Crear un torneo
	$('#crearAnuncio').click(function(e){
		e.preventDefault();	
		$('#formId').val(0); //Índice de nuevo registro
		$('#modalFormulario').modal('show').find('.modal-title').text('Creación de nuevo anuncio');
	});
	
	//Editar un torneo
	//$('#editarTorneo').click(function(e){
	//	e.preventDefault();	
		// $('#formAgno').val(currAgno);
	//	$('#modalFormulario').modal('show').find('.modal-title').text('Creación de nuevo torneo');
	//});
	
	//Validaciones de formulario
	$('#formArchivo').validator().on('submit', function (e) {
		if(!e.isDefaultPrevented())
		{
			$(this).find('BUTTON').prop('disabled', true);
			return true;
		}
	});
	
	//Evento de botón
	$('.formNuevoSubmit').click(function(e){
		e.preventDefault();
		$(this).parents('FORM:first').submit();
	});
	
	//Configurar modal
	$('.modal').on('shown.bs.modal', function () {
		$(this).find('INPUT, SELECT').first().focus().select();
	});
	
	//Ocultar alertas
	setTimeout(function(){ $('.autoHide').hide('clip'); }, 3000);
	
	setDatePicker();
	setTimePicker();
	
	//Tooltips
	$('[data-toggle="tooltip"]').tooltip();
});
	
//Campo de fecha
function setDatePicker()
{
	try
	{
		$('.date').datepicker({
			format: 'yyyy-mm-dd',
			autoclose: true
		});
	} catch(e){ c('No JS > datepicker'); }
}

//Campo de time
function setTimePicker()
{
	try
	{
		$('.time').blur(function(){
			setTime(this);
		}).each(function(){ setTime(this); }).timepicker({
			disableTextInput: true,
			timeFormat: 'H:i:s',
			selectOnBlur: true,
			show2400: true,
			step: 15,
			orientation: 'top'
		});
	} catch(e){ c('No JS > timepicker'); }
}