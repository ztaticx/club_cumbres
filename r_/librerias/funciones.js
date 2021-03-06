function c(s){ try{console.log(s);}catch(e){} }
var _ajaxBussy_ = false;
$.ajaxSetup({
	method: 'post',
	dataType: 'json',
	complete: function(){ _ajaxBussy_ = false; }
});

//Evento de cambio de campo booleano
function cambioBool(o)
{
	o.click(function(e){
		e.preventDefault();
		if(!_ajaxBussy_)
		{
			_ajaxBussy_ = true;
			var t = $(this);
			var clone = t.clone();
			var data = t.data();
			obj = spinner(t);
			var callback = function(obj, data){
				clone.data('valor', data.result);
				obj.replaceWith(clone);
				cambioColor(clone);
				cambioBool(clone);
			}
			cambiar(data.tabla, data.id, data.campo, obj, callback);
		}
	});
}

//Mostrar spinner
function spinner(o)
{
	var classes = o.attr('class') + ' btn-disabled';
	var spin = $('<span class="' + classes + '" disabled><i class="fa fa-spinner fa-spin"></i></span>');
	o.replaceWith(spin);
	return spin;
}

//Mostrar link roto
function broken(o)
{
	var classes = o.attr('class') + ' btn-disabled';
	var spin = $('<span class="' + classes + '" disabled><i class="fa fa-unlink"></i></span>');
	o.replaceWith(spin);
	return spin;
}

//Establecer color
function cambioColor(o)
{
	if(o.data('valor') == 1)
	{
		o.removeClass('btn-danger').addClass('btn-success').text('Activo');
		if(o.hasClass('badge')) o.removeClass('progress-bar-danger').addClass('progress-bar-success'); //Para listado
	}
	else
	{
		o.removeClass('btn-success').addClass('btn-danger').text('Inactivo');
		if(o.hasClass('badge')) o.removeClass('progress-bar-success').addClass('progress-bar-danger');//Para listado
	}
}

//Cambiar el status de un campo booleano
function cambiar(tabla, id, campo, obj, callback)
{	
	$.ajax({
		url: _sitePath_ + 'acciones/cambio' + _suffix_,
		data: { tabla: tabla, id: id, campo: campo },
		method: 'post',
		dataType: 'json',
		success: function(data){
			if(typeof callback == 'function') callback(obj, data);
		},
		error: function(){
			alertError();
			obj.replaceWith('<i class="fa fa-unlink"></i>');
		},
		complete: function(){ _ajaxBussy_ = false; }
	});
}

//Eliminación de registro
var newLocation = '';
function eliminar(o, callback)
{
	$(o).unbind('click').click(function(e){
		e.preventDefault();
		if(!_ajaxBussy_ && confirm('Confirme la eliminación de este registro'))
		{
			_ajaxBussy_ = true;
			
			var t = $(this);
			var data = t.data();
			var clase = t.attr('class');
			var newLocation = '';
			if(typeof data.location != 'undefined') newLocation = data.location;
			obj = spinner(t);
			
			$.ajax({
				url: _sitePath_ + 'acciones/eliminar' + _suffix_,
				data: { tabla: data.tabla, id: data.id },
				method: 'post',
				dataType: 'json',
				success: function(data){
					if(data.result > 0)
					{
						if(newLocation.length == 0)
						{
							//Refrescar página si es necesario
							function eliminarCallback(){ if($('.' + clase.replace(/ /g, '.') + ':visible').size() == 0) window.location.reload(); }
							
							obj.parents('TR:first').fadeOut(eliminarCallback); //Identifica el TR padre del botón y lo desaparece
							obj.parents('.panel:first').fadeOut(eliminarCallback); //Identifica el .panel padre del botón y lo desaparece
							
							//Ejecutar callback si hay uno
							try{ callback(); } catch(e){}
						}
						else
						{
							alert('El registro ha sido eliminado.');
							window.location = newLocation;
						}
					}
					else
					{
						alertError();
						broken(obj);//.replaceWith('<i class="fa fa-unlink"></i>');
					}
				},
				error: function(){
					alertError();
					broken(obj);//.replaceWith('<i class="fa fa-unlink"></i>');
				},
				complete: function(){ _ajaxBussy_ = false; }
			});
		}
	});
}

//Set time field
function setTime(o)
{
	var v = $(o).val();
	try
	{
		var parts = v.split(':');
		if (!/^\d{2}:\d{2}:\d{2}$/.test(v) || (parts[0] > 23 || parts[1] > 59 || parts[2] > 59) || v.length == 0) $(o).val('00:00:00');
	} catch(e){}
}

//Alerta de error
var _errorMsg_ = 'Ha ocurrido un error. Intente de nuevo más tarde.';
function alertError(s)
{
	if(typeof s == 'undefined') s = _errorMsg_;
	alert(s);
}

//Toogle de menú lateral
function sbToogle(){
	if(localStorage.sbHiden == '1')
		$('.navbar-default.sidebar, #page-wrapper').removeClass('sbHide');
	else
		$('.navbar-default.sidebar, #page-wrapper').addClass('sbHide');
}

//Envío masivo de emails
var email_form;
var email_objs;
function emailsMasivos()
{
	//Crear objeto formulario
	if($('#emailMasivo').size() == 0)
	{
		$.ajax({
			url: _sitePath_ + 'r_/templates/email-masivo.html',
			dataType: 'html',
			success: function(data){
				var modal = $(data);
				
				//Eventos de validación en submit
				email_form = modal.find('form');
				email_objs = modal.find(':input');
				$('body').append(modal);
				
				email_form.submit(function(e){
					e.preventDefault();
					if($.trim($('#email-asunto').val()).length > 0 && $.trim($('#email-mensaje').val()).length > 0)
					{
						// email_objs.prop('disabled', true);
						
						//Ocultar alertas
						$('#email-enviando, #email-enviado, #email-error').addClass('hidden');
						
						//Mostrar spinner
						$('#email-enviando').removeClass('hidden');
						
						//Enviar
						$.ajax({
							url: _sitePath_ + 'herramientas/email' + _suffix_,
							data: email_form.serialize(),
							method: 'post',
							dataType: 'json',
							success: function(data){
								if(data.error == 0)
								{
									$('#email-enviado').removeClass('hidden');
									$('#email-cerrar').prop('disabled', false);
								}
								else
								{
									$('#email-error').removeClass('hidden');
								}
							},
							error: function(){
								$('#email-error').removeClass('hidden');
							},
							complete: function(){
								$('#email-enviando').addClass('hidden');
							}
						});
					}
					else alert('Es necesario definir el asunto y el mensaje para continuar.');
				});
				
				//Submitter
				$('#email-enviar').click(function(){
					email_form.submit();
				});
			}
		});
	}
	
	//Asignar eventos
	$('.btn-email-masivo').unbind('click').click(function(e){
		e.preventDefault();
		var destino = $(this).data('destino');
		var valor = $(this).data('destino-valor');
		
		$('#email-enviando, #email-enviado, #email-error').addClass('hidden');
		email_form.get(0).reset();
		
		$('#email-destinatario').val(destino);
		$('#email-destinatario-valor').val(valor);
		email_objs.prop('disabled', false);
		
		//Mostrar modal
		$('#emailMasivo').modal('show');
	});
}

$().ready(function(){
	if(typeof localStorage.sbHiden == 'undefined') localStorage.sbHiden = '0';
	sbToogle();
	$('#sideToogle a').click(function(e){
		e.preventDefault();
		if(localStorage.sbHiden == '1')
		{
			// $('.navbar-default.sidebar, #page-wrapper').removeClass('sbHide');
			localStorage.sbHiden = '0';
			sbToogle();
		}
		else
		{
			// $('.navbar-default.sidebar, #page-wrapper').addClass('sbHide');
			localStorage.sbHiden = '1';
			sbToogle();
		}
	});
	
	//Asignar eventos de envío masivo de emails
	emailsMasivos();
});