/**
 *  Peli-XR for showtime by Rankstar
 *
 *  Copyright (C) 2014 Rankstar
 * 
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 **/
 
(function(plugin) {

// var version = '0.9.9 beta1';


//////////////////////////////////////////////////////////////////////////
//																		//
// 		Declaracion de clases											//
//																		//
//////////////////////////////////////////////////////////////////////////	

	/********************************************************************************
	/* var Item_menu: Objeto que representa los elementos de un Menu				*
	/*	Parametros: 															    *
	/*		titulo: Nombre identificativo											*
	/*		imagen: direccion local o enlace a imagen asociada						*
	/*		page_uri(OPCIONAL): URI que sera abierta cuando el item sea activado	*
	/*		url (OPCIONAL): url asociada al item									*
	/*		descripcion (OPCIONAL): Texto descriptivo								*
	/********************************************************************************/
	var Item_menu = function(titulo,imagen,page_uri,url,descripcion) {
		this.titulo=titulo;
		this.imagen= (imagen.startsWith('http:'))? imagen:(imagen.startsWith('file:'))? imagen:plugin.path + imagen;
		var uri= page_uri || titulo.toLowerCase().replace(/\s+|\.+/g,'');
		this.page_uri=PREFIX + ':' + uri.replace(/^:/,'');
		this.url =url || "";
		this.descripcion= descripcion || "";
	}


//
//Servidores de video
	/********************************************************************************************************	
	/* var HostFactory: AbstractFactory, patron de creacion de objetos del tipo Host (servidores de video)	*
	/* 	para mas informacion vease: 																		*
	/*	http://www.elclubdelprogramador.com/2013/08/29/javascript-patrones-en-javascript-factory-pattern/	*
	/*	http://es.wikipedia.org/wiki/Abstract_Factory														*
	/*																										*
	/*	Ofrece dos metodos estaticos:																		*
	/*		-HostFactory.registrarHost(tipo,clase)															*
	/*		Para poder crear objetos de una clase determinada esta ha de haber sido previamente 			*
	/*		registrada mediante este metodo, donde tipo es un String que identifica a la clase, y clase es 	*
	/*		el nombre de la clase tal y como esta definida.													*
	/*		- HostFactory.createHost (tipo, params)															*
	/*		Metodo que crea una instancia de la clase tipo, heredera de Host, y a la que se le pasa una 	*
	/*		serie de parametros como argumentos.															*
	/*		Retorna: Una instancia de Host o null															*		
	/*******************************************************************************************************/
	var HostFactory = (function () {
		// almacen de clases Host registradas
		var clasesRegistradas = {};

		return {
			createHost: function ( tipo, params ) 
			{
				tipo=tipo.toLowerCase().replace(/\W|\_/g,'');
				var clase = clasesRegistradas[tipo];
				if(clase)
				{
					clase.prototype= new Host(params);			
					return new clase();
				}else{
					return null;
				}
			},
			registrarHost: function ( tipo, clase ) 
			{
				tipo=tipo.toLowerCase().replace(/\W|\_/g,'');
				clasesRegistradas[tipo] = clase;
				return HostFactory;
			}
		};
	})();

	/************************************************************************************************************
	/*	var Host: Objeto que representa un servidor de video generico y del que heredan el resto de servidores	*
	/*	Propiedades:																							*
	/*		titulo,servidor,url_video,idioma,calidad															*
	/*	Metodos: (implementados en las subclases)																*
	/*		esservidoradulto: Indica si es un servidor de adultos o no.											*
	/*			Parametros: ninguno																				*
	/*			Retorna: true si es un servidor de adultos, false si no lo es.									*
	/*		geturl_video: Devuelve la url del video.															*
	/*			Parametro:	url_servidor, direccion de la que se debe extraer la url del video.					*	
	/*			Retorna: String que representa la url del video o 'error'										*
	/***********************************************************************************************************/
	var Host= function(params){
		//Propìedades
		this.servidor=params.servidor.replace(/\W|\_/g,'');
		this.titulo="Ver en " + this.servidor.toProperCase();
		this.url_video=params.url_host;
		this.idioma=params.idioma;
		this.calidad=params.calidad;

		//metodos publicos que seran redefinidos por las clases herederas
		/************************************************************************
		/*	funcion esservidoradulto: Indica si es un servidor de adultos o no. *
		/*	Parametros: ninguno													*
		/*	Retorna: true si es un servidor de adultos, false si no lo es.		*
		/***********************************************************************/
		this.esservidoradulto= function () {}

		/****************************************************************************
		/*	funcion geturl_video: Devuelve la url del video.						*
		/*	Parametros:																*
		/*		url_servidor: direccion de la que se debe extraer la url del video.	*	
		/*	Retorna: String que representa la url del video o 'error'				*							
		/***************************************************************************/
		this.geturl_video= function (url_servidor) {}	

	}

	/********************************************************************************	
	/* var StreamsRtmp: Objeto utilizado para pasar enlaces RTMP					*
	/*		Hereda de Host															*
	/*******************************************************************************/
	var StreamsRtmp=function() {

		//metodos publicos

		/************************************************************************
		/*	funcion esservidoradulto: Indica si es un servidor de adultos o no. *
		/*	Parametros: ninguno													*
		/*	Retorna: true si es un servidor de adultos, false si no lo es.		*
		/***********************************************************************/
		this.esservidoradulto= function () {
			return false;
		}

		/****************************************************************************
		/*	funcion geturl_video: Devuelve la url del video.						*
		/*	Parametros:																*
		/*		url_servidor: direccion de la que se debe extraer la url del video.	*	
		/*	Retorna: String que representa la url del video o 'error'				*							
		/***************************************************************************/
		this.geturl_video= function (url_servidor)
			{
			//En este caso esta funcion no es necesaria
			//La mantenemos por coherencia
			return url_servidor;
		}
	}
	HostFactory.registrarHost("streamsrtmp",StreamsRtmp); //Registrar la clase StreamsRtmp

	/********************************************************************************	
	/* var Allmyvideos: Objeto que representa el servidor Allmyvideo				*
	/*		Hereda de Host															*
	/*******************************************************************************/
	var Allmyvideos= function() {

		//metodos publicos

		/************************************************************************
		/*	funcion esservidoradulto: Indica si es un servidor de adultos o no. *
		/*	Parametros: ninguno													*
		/*	Retorna: true si es un servidor de adultos, false si no lo es.		*
		/***********************************************************************/
		this.esservidoradulto= function () {
			return false;
		}

		/****************************************************************************
		/*	funcion geturl_video: Devuelve la url del video.						*
		/*	Parametros:																*
		/*		url_servidor: direccion de la que se debe extraer la url del video.	*	
		/*	Retorna: String que representa la url del video o 'error'				*							
		/***************************************************************************/
		this.geturl_video= function (url_servidor)
			{
			var file_contents = get_urlsource(url_servidor);
			//si sale esto esta borrado <b class="err">
			var error = file_contents.indexOf('<b class="err">')
			if(error==-1)
			{
				var op = extraer_texto(file_contents,'<input type="hidden" name="op" value="','"');
				var usr_login = extraer_texto(file_contents,'<input type="hidden" name="usr_login" value="','"');
				var id = extraer_texto(file_contents,'<input type="hidden" name="id" value="','"');
				var fname = extraer_texto(file_contents,'<input type="hidden" name="fname" value="','"');
				var referer = extraer_texto(file_contents,'<input type="hidden" name="referer" value="','"');
				var method_free = extraer_texto(file_contents,'<input type="hidden" name="method_free" value="','"');		
				file_contents = ""

				showtime.sleep(1000);

				var datos_post = {'op':op,'usr_login':usr_login,'id':id,'fname':fname,'referer':referer,'method_free':method_free,'x':'109','y':'17'};
				file_contents = post_urlsource(url_servidor,datos_post);

				var aux_string = extraer_texto(file_contents,'"sources" : [',']');
				var pos_ini = aux_string.lastIndexOf('"file"');
				aux_string = aux_string.substr(pos_ini);
				var url_video = extraer_texto(aux_string,'file" : "','",');
				file_contents = "";
			}else{
				url_video='error';
			}
		return url_video;
		}


	}
	HostFactory.registrarHost("allmyvideos",Allmyvideos); //Registrar la clase Allmyvideo

	/********************************************************************************	
	/* var Api_video_mail: Objeto que representa el servidor Api_video_mail			*
	/*		Hereda de Host															*
	/********************************************************************************/
	var Api_video_mail= function() {

		//metodos publicos

		/************************************************************************
		/*	funcion esservidoradulto: Indica si es un servidor de adultos o no. *
		/*	Parametros: ninguno													*
		/*	Retorna: true si es un servidor de adultos, false si no lo es.		*
		/***********************************************************************/
		this.esservidoradulto= function () {
			return false;
		}

		/****************************************************************************
		/*	funcion geturl_video: Devuelve la url del video.						*
		/*	Parametros:																*
		/*		url_servidor: direccion de la que se debe extraer la url del video.	*	
		/*	Retorna: String que representa la url del video o 'error'				*									*
		/***************************************************************************/
		this.geturl_video= function (url_servidor)
		{
			var file_contents = get_urlsource(url_servidor);
			//si sale esto esta borrado null	
			var error = file_contents.indexOf('null')
			var url_video;
			if(error==-1)
			{
				url_video = extraer_texto(file_contents,'videoSrc = "','"');
				file_contents = ""
			}else{
				url_video='error';
			}
		return url_video;
		}


	}
	HostFactory.registrarHost("apivideomail",Api_video_mail); //Registrar la clase Api_video_mail

	/********************************************************************************	
	/* var Bestreams: Objeto que representa el servidor Bestreams					*
	/*		Hereda de Host															*
	/********************************************************************************/
	var Bestreams= function() {

		//metodos publicos

		/************************************************************************
		/*	funcion esservidoradulto: Indica si es un servidor de adultos o no. *
		/*	Parametros: ninguno													*
		/*	Retorna: true si es un servidor de adultos, false si no lo es.		*
		/***********************************************************************/
		this.esservidoradulto= function () {
			return false;
		}

		/****************************************************************************
		/*	funcion geturl_video: Devuelve la url del video.						*
		/*	Parametros:																*
		/*		url_servidor: direccion de la que se debe extraer la url del video.	*	
		/*	Retorna: String que representa la url del video o 'error'				*									*
		/***************************************************************************/
		this.geturl_video= function (url_servidor)
		{
			var file_contents = get_urlsource(url_servidor);
			var error = file_contents.indexOf('Not Found')
			if(error==-1)
			{
				var op = extraer_texto(file_contents,'<input type="hidden" name="op" value="','"');
				var usr_login = extraer_texto(file_contents,'<input type="hidden" name="usr_login" value="','"');
				var id = extraer_texto(file_contents,'<input type="hidden" name="id" value="','"');
				var fname = extraer_texto(file_contents,'<input type="hidden" name="fname" value="','"');
				var referer = extraer_texto(file_contents,'<input type="hidden" name="referer" value="','"');
				var hash = extraer_texto(file_contents,'<input type="hidden" name="hash" value="','"');
				var imhuman = extraer_texto(file_contents,'<input type="submit" name="imhuman" value="','"').replace(/ /g,'+');
				file_contents = ""
				//page.metadata.title = 'Cargando video ...  ' + 'Espera 3 segundos';
				showtime.sleep(1000);
				//page.metadata.title = 'Cargando video ...  ' + 'Espera 2 segundos';
				showtime.sleep(1000);
				//page.metadata.title = 'Cargando video ...  ' + 'Espera 1 segundos';
				showtime.sleep(1000);		

				var datos_post = {'op':op,'usr_login':usr_login,'id':id,'fname':fname,'referer':referer,'hash':hash,'imhuman':imhuman};
				file_contents = showtime.httpReq(url_servidor, 
					{
						debug: false,
						compression: true,
						method: 'POST',
						postdata: datos_post,
						headers: 
						{
							'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:15.0) Gecko/20100101 Firefox/15.0.1',
							'Referer' : url_servidor
						}
					}).toString();

				var url_video = extraer_texto(file_contents,'file: "','"');
				file_contents = "";
			}else{
				url_video='error';
			}
		return url_video;
		}


	}
	HostFactory.registrarHost("bestreams",Bestreams); //Registrar la clase Bestreams

	/********************************************************************************	
	/* var Filenuke: Objeto que representa el servidor Filenuke						*
	/*		Hereda de Host															*
	/********************************************************************************/
	var Filenuke= function() {

		//metodos publicos

		/************************************************************************
		/*	funcion esservidoradulto: Indica si es un servidor de adultos o no. *
		/*	Parametros: ninguno													*
		/*	Retorna: true si es un servidor de adultos, false si no lo es.		*
		/***********************************************************************/
		this.esservidoradulto= function () {
			return false;
		}

		/****************************************************************************
		/*	funcion geturl_video: Devuelve la url del video.						*
		/*	Parametros:																*
		/*		url_servidor: direccion de la que se debe extraer la url del video.	*	
		/*	Retorna: String que representa la url del video o 'error'				*									*
		/***************************************************************************/
		this.geturl_video= function (url_servidor)
		{
			//detectar el tipo hay .com y .net
			var dominio= url_servidor.split('/')[2].match(/\.\w{2,3}$/i);

			if(dominio=='.net')
			{
				url_video='error';				
			}else{
				var file_contents = get_urlsource(url_servidor);
				var error = file_contents.indexOf('Not Found')
				if(error==-1)
				{
					var op = extraer_texto(file_contents,'<input type="hidden" name="op" value="','"');
					var usr_login = extraer_texto(file_contents,'<input type="hidden" name="usr_login" value="','"');
					var id = extraer_texto(file_contents,'<input type="hidden" name="id" value="','"');
					var fname = extraer_texto(file_contents,'<input type="hidden" name="fname" value="','"');
					var referer = extraer_texto(file_contents,'<input type="hidden" name="referer" value="','"');
					var method_free = extraer_texto(file_contents,'<input type="hidden" name="method_free" value="','"');		
					file_contents = ""

					showtime.sleep(1000);
					var datos_post = {'op':op,'usr_login':usr_login,'id':id,'fname':fname,'referer':referer,'method_free':method_free,'x':'109','y':'17'};
					file_contents = post_urlsource(url_servidor,datos_post);
					var url_video = extraer_texto(file_contents,"addVariable('file', '","'");
					file_contents = "";
				}else{
					url_video='error';
				}
			}
		return url_video;
		}

	}
	HostFactory.registrarHost("filenuke",Filenuke); //Registrar la clase Filenuke

	/********************************************************************************	
	/* var Magnovideo: Objeto que representa el servidor Magnovideo					*
	/*		Hereda de Host															*
	/********************************************************************************/
	var Magnovideo= function() {

		//metodos publicos

		/************************************************************************
		/*	funcion esservidoradulto: Indica si es un servidor de adultos o no. *
		/*	Parametros: ninguno													*
		/*	Retorna: true si es un servidor de adultos, false si no lo es.		*
		/***********************************************************************/
		this.esservidoradulto= function () {
			return false;
		}

		/****************************************************************************
		/*	funcion geturl_video: Devuelve la url del video.						*
		/*	Parametros:																*
		/*		url_servidor: direccion de la que se debe extraer la url del video.	*	
		/*	Retorna: String que representa la url del video o 'error'				*									*
		/***************************************************************************/
		this.geturl_video= function (url_servidor)
		{
			var id_magnovideo;
			id_magnovideo = url_servidor.replace('http://www.magnovideo.com/?v=','');
			url_servidor = 'http://www.magnovideo.com/player_config.php?mdid=' + id_magnovideo + '&sml=1&autoplay=true';

			var file_contents = get_urlsource(url_servidor);	
			var storage_path = extraer_texto(file_contents,'<storage_path>','</storage_path>');
			var video_name = extraer_texto(file_contents,'<video_name>','</video_name>');
			var title_thumbs = extraer_texto(file_contents,'<tile_thumbs>','</tile_thumbs>');
			var movie_burst  = extraer_texto(file_contents,'<movie_burst>','</movie_burst>') + 'k';
			var burst_speed  = extraer_texto(file_contents,'<burst_speed>','</burst_speed>') + 'k';
			var ste  = extraer_texto(file_contents,'<ste>','</ste>');

			//construir la url
			var pos_aux;
			var aux_string = title_thumbs;

			pos_aux = aux_string .indexOf('storage/files/');
			aux_string = aux_string .substr(pos_aux+14);
			pos_aux = aux_string .indexOf('/');
			aux_string = aux_string .substr(pos_aux+1);
			aux_string = aux_string.replace('tmpsmall/tiles.jpg','');

			var url_video = storage_path + 'storage/files/' + aux_string + video_name + '?burst=' + movie_burst + '&u=' + burst_speed + '&' + ste;

			showtime.sleep(1000);

			//showtime.trace('Debug: ' + url_video);
			//"http://e1.magnovideo.com:8080/storage/files/0/15/107/52/1.mp4?burst=5905k&u=600k&md=3LOQPhshwrZSW1knDdUGiA&e=1391099841"
			//http://www.magnovideo.com/player_config.php?mdid="+id_video+"&sml=1&autoplay=true
			//http://www.magnovideo.com/?v=JCRFATY
			//http://www.magnovideo.com/player_config.php?mdid=JCRFATY&sml=1&autoplay=true

		return url_video;
		}

	}
	HostFactory.registrarHost("magnovideo",Magnovideo); //Registrar la clase Magnovideo

	/********************************************************************************	
	/* var Mightyupload: Objeto que representa el servidor Mightyupload				*
	/*		Hereda de Host															*
	/*******************************************************************************/
	var Mightyupload= function() {

		//metodos publicos

		/************************************************************************
		/*	funcion esservidoradulto: Indica si es un servidor de adultos o no. *
		/*	Parametros: ninguno													*
		/*	Retorna: true si es un servidor de adultos, false si no lo es.		*
		/***********************************************************************/
		this.esservidoradulto= function () {
			return false;
		}

		/****************************************************************************
		/*	funcion geturl_video: Devuelve la url del video.						*
		/*	Parametros:																*
		/*		url_servidor: direccion de la que se debe extraer la url del video.	*	
		/*	Retorna: String que representa la url del video o 'error'				*									*
		/***************************************************************************/
		this.geturl_video= function (url_servidor)
		{
			var file_contents = get_urlsource(url_servidor);
			var error = file_contents.indexOf('File Not Found')
			if(error==-1)
			{
				var op = extraer_texto(file_contents,'<input type="hidden" name="op" value="','"');
				var id = extraer_texto(file_contents,'<input type="hidden" name="id" value="','"');
				var rand = extraer_texto(file_contents,'<input type="hidden" name="rand" value="','"');
				var referer = extraer_texto(file_contents,'<input type="hidden" name="referer" value="','"');
				var plugins_are_not_allowed = extraer_texto(file_contents,'<input type="hidden" name="plugins_are_not_allowed" value="','"');
				var method_free = extraer_texto(file_contents,'<input type="hidden" name="method_free" value="','"');
				var method_premium = extraer_texto(file_contents,'<input type="hidden" name="method_premium" value="','"');
				var down_direct = extraer_texto(file_contents,'<input type="hidden" name="down_direct" value="','"');
				file_contents = ""
				showtime.sleep(1000);

				var datos_post = {'op':op, 'id':id, 'rand':rand, 'referer':referer, 'plugins_are_not_allowed':plugins_are_not_allowed, 'method_free':method_free, 'method_premium':method_premium, 'down_direct':down_direct};
				file_contents = post_urlsource(url_servidor,datos_post);
				var url_video = extraer_texto(file_contents,"file: '","'");
				file_contents = "";
			}else{
				url_video='error';
			}
		return url_video;
		}


	}
	HostFactory.registrarHost("mightyupload",Mightyupload); //Registrar la clase Mightyupload

	/********************************************************************************	
	/* var Movshare: Objeto que representa el servidor Movshare						*
	/*		Hereda de Host															*
	/********************************************************************************/
	var Movshare= function() {

		//metodos publicos

		/************************************************************************
		/*	funcion esservidoradulto: Indica si es un servidor de adultos o no. *
		/*	Parametros: ninguno													*
		/*	Retorna: true si es un servidor de adultos, false si no lo es.		*
		/***********************************************************************/
		this.esservidoradulto= function () {
			return false;
		}

		/****************************************************************************
		/*	funcion geturl_video: Devuelve la url del video.						*
		/*	Parametros:																*
		/*		url_servidor: direccion de la que se debe extraer la url del video.	*	
		/*	Retorna: String que representa la url del video o 'error'				*									*
		/***************************************************************************/
		this.geturl_video= function (url_servidor)
		{
			//detectar el tipo hay .me y .net
			var dominio= url_servidor.split('/')[2].match(/\.\w{2,3}$/i);
			if(dominio=='.me')
			{
				url_video='error';				
			}else{			
				var file_contents = get_urlsource(url_servidor);
				var error = file_contents.indexOf('This file no longer exists')
				if(error==-1)
				{
					var videoplay = extraer_texto(file_contents,'<input type="hidden" name="videoplay" value="','"');
					file_contents = ""
					showtime.sleep(1000);

					var datos_post = {'videoplay':videoplay};
					file_contents = post_urlsource(url_servidor,datos_post);
					var url_video = extraer_texto(file_contents,'file: "','"');
					file_contents = "";
				}else{
					url_video='error';
				}
			}
		return url_video;
		}

	}
	HostFactory.registrarHost("movshare",Movshare); //Registrar la clase Movshare

	/********************************************************************************	
	/* var Novamov: Objeto que representa el servidor Novamov						*
	/*		Hereda de Host															*
	/********************************************************************************/
	var Novamov= function() {

		//metodos publicos

		/************************************************************************
		/*	funcion esservidoradulto: Indica si es un servidor de adultos o no. *
		/*	Parametros: ninguno													*
		/*	Retorna: true si es un servidor de adultos, false si no lo es.		*
		/***********************************************************************/
		this.esservidoradulto= function () {
			return false;
		}

		/****************************************************************************
		/*	funcion geturl_video: Devuelve la url del video.						*
		/*	Parametros:																*
		/*		url_servidor: direccion de la que se debe extraer la url del video.	*	
		/*	Retorna: String que representa la url del video o 'error'				*									*
		/***************************************************************************/
		this.geturl_video= function (url_servidor)
		{
			//detectar el tipo hay .me y .net
			var dominio= url_servidor.split('/')[2].match(/\.\w{2,3}$/i);
			if(dominio=='.me')
			{
				url_video='error';				
			}else{			
				var file_contents = get_urlsource(url_servidor);
				var error = file_contents.indexOf('This file no longer exists on our servers!')
				if(error==-1)
				{
					var file = extraer_texto(file_contents,'flashvars.file="','";');
					var key = extraer_texto(file_contents,'flashvars.filekey="','";');
					var cid1 = extraer_texto(file_contents,'flashvars.cid="','";');

					file_contents = "";
					var pos = url_servidor.indexOf('/video/');
					var url_video = url_servidor.substr(0,pos);
					url_video = url_video + '/api/player.api.php?file=' + file + '&cid3=undefined&cid1=' + cid1 + 'numOfErrors=0&user=undefined&pass=undefined&key=' + key + '&cid2=undefined';

					showtime.sleep(1000);
					file_contents = get_urlsource(url_video);
					url_video = file_contents.substr(4);
					pos = url_video.indexOf('&');
					url_video = url_video.substr(0,(pos));
				}else{
					url_video='error';
				}
			}
		return url_video;
		}


	}
	HostFactory.registrarHost("novamov",Novamov); //Registrar la clase Novamov

	/********************************************************************************	
	/* var Nowvideo: Objeto que representa el servidor Nowvideo						*
	/*		Hereda de Host															*
	/********************************************************************************/
	var Nowvideo= function() {

		//metodos publicos

		/************************************************************************
		/*	funcion esservidoradulto: Indica si es un servidor de adultos o no. *
		/*	Parametros: ninguno													*
		/*	Retorna: true si es un servidor de adultos, false si no lo es.		*
		/***********************************************************************/
		this.esservidoradulto= function () {
			return false;
		}

		/****************************************************************************
		/*	funcion geturl_video: Devuelve la url del video.						*
		/*	Parametros:																*
		/*		url_servidor: direccion de la que se debe extraer la url del video.	*	
		/*	Retorna: String que representa la url del video o 'error'				*									*
		/***************************************************************************/
		this.geturl_video= function (url_servidor)
		{
			//detectar el tipo hay .ws y .ch
			var dominio= url_servidor.split('/')[2].match(/\.\w{2,3}$/i);
			if(dominio=='.ws')
			{
				url_video='error';				
			}else{
				if(url_servidor.indexOf('embed.nowvideo')>0)
					{
					var id_video=url_servidor.substr(url_servidor.indexOf('=')+1);
					id_video=id_video.substr(0,id_video.indexOf('&'));
					url_servidor='http://www.nowvideo.sx/video/' + id_video
					}
				var file_contents = get_urlsource(url_servidor);				
				var key = extraer_texto(file_contents,'var fkzd="','";');
				var cid1 = extraer_texto(file_contents,'flashvars.cid="','";');
				var file = extraer_texto(file_contents,'flashvars.file="','";');
				file_contents = "";

				var pos = url_servidor.indexOf('/video/');
				var url_video = url_servidor.substr(0,pos);
				url_video = url_video + '/api/player.api.php?key=' + key + '&cid=' + cid1 + '&cid3=undefined&pass=undefined&user=undefined&file=' + file + '&numOfErrors=0&cid2=undefined';
				showtime.sleep(1000);

				file_contents = get_urlsource(url_video);
				url_video = file_contents.substr(4);
				pos = url_video.indexOf('&');
				url_video = url_video.substr(0,(pos));
			}
		return url_video;
		}

	}
	HostFactory.registrarHost("nowvideo",Nowvideo); //Registrar la clase nowvideo

	/********************************************************************************	
	/* var Played: Objeto que representa el servidor Played							*
	/*		Hereda de Host															*
	/********************************************************************************/
	var Played= function() {

		//metodos publicos

		/************************************************************************
		/*	funcion esservidoradulto: Indica si es un servidor de adultos o no. *
		/*	Parametros: ninguno													*
		/*	Retorna: true si es un servidor de adultos, false si no lo es.		*
		/***********************************************************************/
		this.esservidoradulto= function () {
			return false;
		}

		/****************************************************************************
		/*	funcion geturl_video: Devuelve la url del video.						*
		/*	Parametros:																*
		/*		url_servidor: direccion de la que se debe extraer la url del video.	*	
		/*	Retorna: String que representa la url del video o 'error'				*									*
		/***************************************************************************/
		this.geturl_video= function (url_servidor)
		{
			var file_contents = get_urlsource(url_servidor);
			var error = file_contents.indexOf('<b class="err"')

			if(error==-1)
			{	
				url_servidor = 'http://played.to/embed-' + url_servidor.substr(url_servidor.lastIndexOf('/')+1) + '-640x360.html';

				file_contents = get_urlsource(url_servidor);
				var url_video = extraer_texto(file_contents,'file: "','"');
				file_contents = "";
			}else{
				url_video = 'error';
			}
		return url_video;
		}

	}
	HostFactory.registrarHost("played",Played); //Registrar la clase Playedto

	/********************************************************************************	
	/* var Streamcloud: Objeto que representa el servidor Streamcloud				*
	/*		Hereda de Host															*
	/********************************************************************************/
	var Streamcloud= function() {

		//metodos publicos

		/************************************************************************
		/*	funcion esservidoradulto: Indica si es un servidor de adultos o no. *
		/*	Parametros: ninguno													*
		/*	Retorna: true si es un servidor de adultos, false si no lo es.		*
		/***********************************************************************/
		this.esservidoradulto= function () {
			return false;
		}

		/****************************************************************************
		/*	funcion geturl_video: Devuelve la url del video.						*
		/*	Parametros:																*
		/*		url_servidor: direccion de la que se debe extraer la url del video.	*	
		/*	Retorna: String que representa la url del video o 'error'				*									*
		/***************************************************************************/
		this.geturl_video= function (url_servidor)
		{
			var file_contents = get_urlsource(url_servidor);
			var error = file_contents.indexOf('Not Found')
			if(error==-1)
			{
				var contador = extraer_texto(file_contents,'var count = ',';');
				var op = extraer_texto(file_contents,'<input type="hidden" name="op" value="','"');
				var usr_login = extraer_texto(file_contents,'<input type="hidden" name="usr_login" value="','"');
				var id = extraer_texto(file_contents,'<input type="hidden" name="id" value="','"');
				var fname = extraer_texto(file_contents,'<input type="hidden" name="fname" value="','"');
				var referer = extraer_texto(file_contents,'<input type="hidden" name="referer" value="','"');
				var hash = extraer_texto(file_contents,'<input type="hidden" name="hash" value="','"');
				var imhuman = extraer_texto(file_contents,'<input type="submit" name="imhuman" id="btn_download" class="button gray" value="','"');
				file_contents = ""

				contador = parseInt(contador) + 5;
				var j;
				for (j=0;j<parseInt(contador);j++)
				{
					//page.metadata.title = 'Cargando video ...  ' + 'Espera ' + (contador - j) + ' segundos';
					showtime.sleep(1000);
				}

				var datos_post = {'op':op,'usr_login':usr_login,'id':id,'fname':fname,'referer':referer,'hash':hash,'imhuman':imhuman};
				file_contents = post_urlsource(url_servidor,datos_post);
				var url_video = extraer_texto(file_contents,'file: "','"');
				file_contents = "";
			}else{
				url_video = 'error';
			}
		return url_video;
		}

	}
	HostFactory.registrarHost("streamcloud",Streamcloud); //Registrar la clase Streamcloud

	/********************************************************************************	
	/* var Videobam: Objeto que representa el servidor Videobam						*
	/*		Hereda de Host															*
	/********************************************************************************/
	var Videobam= function() {

		//metodos publicos

		/************************************************************************
		/*	funcion esservidoradulto: Indica si es un servidor de adultos o no. *
		/*	Parametros: ninguno													*
		/*	Retorna: true si es un servidor de adultos, false si no lo es.		*
		/***********************************************************************/
		this.esservidoradulto= function () {
			return false;
		}

		/****************************************************************************
		/*	funcion geturl_video: Devuelve la url del video.						*
		/*	Parametros:																*
		/*		url_servidor: direccion de la que se debe extraer la url del video.	*	
		/*	Retorna: String que representa la url del video o 'error'				*									*
		/***************************************************************************/
		this.geturl_video= function (url_servidor)
		{
			var file_contents = get_urlsource(url_servidor);
			var error = file_contents.indexOf('404 Page Not Found')
			if(error==-1)
			{
				var url_video = extraer_texto(file_contents,'"scaling":"fit","url":"','"');
				file_contents = "";
				url_video = url_video.replace(/(\\\/)/g,'/');
			}else{
				url_video='error';
			}
		return url_video;
		}

	}
	HostFactory.registrarHost("videobam",Videobam); //Registrar la clase Videobam

	/********************************************************************************	
	/* var Videoweed: Objeto que representa el servidor Videoweed					*
	/*		Hereda de Host															*
	/********************************************************************************/
	var Videoweed= function() {

		//metodos publicos

		/************************************************************************
		/*	funcion esservidoradulto: Indica si es un servidor de adultos o no. *
		/*	Parametros: ninguno													*
		/*	Retorna: true si es un servidor de adultos, false si no lo es.		*
		/***********************************************************************/
		this.esservidoradulto= function () {
			return false;
		}

		/****************************************************************************
		/*	funcion geturl_video: Devuelve la url del video.						*
		/*	Parametros:																*
		/*		url_servidor: direccion de la que se debe extraer la url del video.	*	
		/*	Retorna: String que representa la url del video o 'error'				*									*
		/***************************************************************************/
		this.geturl_video= function (url_servidor)
		{
			var file_contents = get_urlsource(url_servidor);
			var error = file_contents.indexOf('This file no longer exists');
			if(error==-1)
			{
				var file = extraer_texto(file_contents,'flashvars.file="','";');
				var key = extraer_texto(file_contents,'flashvars.filekey="','";');
				var cid1 = extraer_texto(file_contents,'flashvars.cid="','";');

				file_contents = "";
				var pos = url_servidor.indexOf('/file/');
				var url_video = url_servidor.substr(0,pos);
				url_video = url_video + '/api/player.api.php?file=' + file + '&cid3=undefined&cid1=' + cid1 + 'numOfErrors=0&user=undefined&pass=undefined&key=' + key + '&cid2=undefined';

				//showtime.trace('Debug ' + url_video);
				showtime.sleep(1000);
				file_contents = get_urlsource(url_video);
				url_video = file_contents.substr(4);
				pos = url_video.indexOf('&');
				url_video = url_video.substr(0,(pos));
			}else{
				url_video='error';
			}
		return url_video;
		}

	}
	HostFactory.registrarHost("videoweed",Videoweed); //Registrar la clase Videoweed

	/********************************************************************************	
	/* var Vidspot: Objeto que representa el servidor Vidspot						*
	/*		Hereda de Host															*
	/********************************************************************************/
	var Vidspot= function() {

		//metodos publicos

		/************************************************************************
		/*	funcion esservidoradulto: Indica si es un servidor de adultos o no. *
		/*	Parametros: ninguno													*
		/*	Retorna: true si es un servidor de adultos, false si no lo es.		*
		/***********************************************************************/
		this.esservidoradulto= function () {
			return false;
		}

		/****************************************************************************
		/*	funcion geturl_video: Devuelve la url del video.						*
		/*	Parametros:																*
		/*		url_servidor: direccion de la que se debe extraer la url del video.	*	
		/*	Retorna: String que representa la url del video o 'error'				*									*
		/***************************************************************************/
		this.geturl_video= function (url_servidor)
		{
			var file_contents = get_urlsource(url_servidor);
			var error = file_contents.indexOf('<b class="err">')
			if(error==-1)
			{
				var op = extraer_texto(file_contents,'<input type="hidden" name="op" value="','"');
				var usr_login = extraer_texto(file_contents,'<input type="hidden" name="usr_login" value="','"');
				var id = extraer_texto(file_contents,'<input type="hidden" name="id" value="','"');
				var fname = extraer_texto(file_contents,'<input type="hidden" name="fname" value="','"');
				var referer = extraer_texto(file_contents,'<input type="hidden" name="referer" value="','"');
				var method_free = extraer_texto(file_contents,'<input type="hidden" name="method_free" value="','"');		
				file_contents = ""

				showtime.sleep(1000);

				var datos_post = {'op':op,'usr_login':usr_login,'id':id,'fname':fname,'referer':referer,'method_free':method_free,'x':'109','y':'17'};
				file_contents = post_urlsource(url_servidor,datos_post);
				var url_video = extraer_texto(file_contents,'file: "','"');

				var aux_string = extraer_texto(file_contents,'"sources" : [',']');
				var pos_ini = aux_string.lastIndexOf('"file"');
				aux_string = aux_string.substr(pos_ini);
				var url_video = extraer_texto(aux_string,'file" : "','",');
				file_contents = "";
			}else{
				url_video='error';
			}
		return url_video;
		}

	}
	HostFactory.registrarHost("vidspot",Vidspot); //Registrar la clase Vidspot

	/********************************************************************************	
	/* var Vk: Objeto que representa el servidor Vk									*
	/*		Hereda de Host															*
	/********************************************************************************/
	var Vk= function() {

		//metodos publicos

		/************************************************************************
		/*	funcion esservidoradulto: Indica si es un servidor de adultos o no. *
		/*	Parametros: ninguno													*
		/*	Retorna: true si es un servidor de adultos, false si no lo es.		*
		/***********************************************************************/
		this.esservidoradulto= function () {
			return false;
		}

		/****************************************************************************
		/*	funcion geturl_video: Devuelve la url del video.						*
		/*	Parametros:																*
		/*		url_servidor: direccion de la que se debe extraer la url del video.	*	
		/*	Retorna: String que representa la url del video o 'error'				*									*
		/***************************************************************************/
		this.geturl_video= function (url_servidor)
		{
			var file_contents = get_urlsource(url_servidor);
			var url_video;
			var error = file_contents.indexOf('No videos found')
			if(error==-1)
			{
				if(file_contents.indexOf('url240=')!=-1) { url_video=extraer_texto(file_contents,'url240=','&amp'); }				
				if(file_contents.indexOf('url360=')!=-1) { url_video=extraer_texto(file_contents,'url360=','&amp'); }				
				if(file_contents.indexOf('url480=')!=-1) { url_video=extraer_texto(file_contents,'url480=','&amp'); }				
				if(file_contents.indexOf('url720=')!=-1) { url_video=extraer_texto(file_contents,'url720=','&amp'); }
			}else{
				url_video='error';
			}
		return url_video;
		}

	}
	HostFactory.registrarHost("vk",Vk); //Registrar la clase Vk

	/********************************************************************************	
	/* var Redtube: Objeto que representa el servidor Redtube						*
	/*		Hereda de Host															*
	/********************************************************************************/
	var Redtube= function() {

		//metodos publicos

		/************************************************************************
		/*	funcion esservidoradulto: Indica si es un servidor de adultos o no. *
		/*	Parametros: ninguno													*
		/*	Retorna: true si es un servidor de adultos, false si no lo es.		*
		/***********************************************************************/
		this.esservidoradulto= function () {
			return true;
		}

		/****************************************************************************
		/*	funcion geturl_video: Devuelve la url del video.						*
		/*	Parametros:																*
		/*		url_servidor: direccion de la que se debe extraer la url del video.	*	
		/*	Retorna: String que representa la url del video o 'error'				*									*
		/***************************************************************************/
		this.geturl_video= function (url_servidor)
		{
			var file_contents = get_urlsource(url_servidor);
			var error = file_contents.indexOf('This video has been deleted')
			if(error == -1)
			{
				//var url_video = "http://videos.mp4.redtubefiles.com/" + unescape(extraer_texto(file_contents, 'http://videos.mp4.redtubefiles.com/','"'));
				var url_video = extraer_texto(file_contents,"<source src='","'");
			}else{
				url_video = 'error';
			}
		return url_video;	
		}

	}
	HostFactory.registrarHost("redtube",Redtube); //Registrar la clase Redtube

	/********************************************************************************	
	/* var Xhamster: Objeto que representa el servidor Xhamster						*
	/*		Hereda de Host															*
	/********************************************************************************/
	var Xhamster= function() {

		//metodos publicos

		/************************************************************************
		/*	funcion esservidoradulto: Indica si es un servidor de adultos o no. *
		/*	Parametros: ninguno													*
		/*	Retorna: true si es un servidor de adultos, false si no lo es.		*
		/***********************************************************************/
		this.esservidoradulto= function () {
			return true;
		}

		/****************************************************************************
		/*	funcion geturl_video: Devuelve la url del video.						*
		/*	Parametros:																*
		/*		url_servidor: direccion de la que se debe extraer la url del video.	*	
		/*	Retorna: String que representa la url del video o 'error'				*									*
		/***************************************************************************/
		this.geturl_video= function (url_servidor)
		{
			var file_contents = get_urlsource(url_servidor);
			var error = file_contents.indexOf('404 - Page Not Found')
			if(error==-1)
			{
				var url_video = extraer_texto(file_contents,"<div class='noFlash'>","</div>");
				url_video = extraer_texto(url_video,'<a href="','"');
			}else{
				url_video='error';
			}
		return url_video;
		}

	}
	HostFactory.registrarHost("xhamster",Xhamster); //Registrar la clase Xhamster

	/********************************************************************************	
	/* var Xvideos: Objeto que representa el servidor Xvideos						*
	/*		Hereda de Host															*
	/********************************************************************************/
	var Xvideos= function() {

		//metodos publicos

		/************************************************************************
		/*	funcion esservidoradulto: Indica si es un servidor de adultos o no. *
		/*	Parametros: ninguno													*
		/*	Retorna: true si es un servidor de adultos, false si no lo es.		*
		/***********************************************************************/
		this.esservidoradulto= function () {
			return true;
		}

		/****************************************************************************
		/*	funcion geturl_video: Devuelve la url del video.						*
		/*	Parametros:																*
		/*		url_servidor: direccion de la que se debe extraer la url del video.	*	
		/*	Retorna: String que representa la url del video o 'error'				*									*
		/***************************************************************************/
		this.geturl_video= function (url_servidor)
		{
			var file_contents = get_urlsource(url_servidor);
			var error = file_contents.indexOf('This video has been deleted')
			if(error==-1)
			{
				var url_video = unescape(extraer_texto(file_contents,'flv_url=','&amp'));
			}else{
				url_video='error';
			}
		return url_video;
		}

	}
	HostFactory.registrarHost("xvideos",Xvideos); //Registrar la clase Xvideos
	
	
	
	/********************************************************************************	
	/* var Youtube: Objeto que representa el servidor Vidspot						*
	/*		Hereda de Host															*
	/********************************************************************************/
	var Youtube= function() {
		
		//metodos publicos
		
		/************************************************************************
		/*	funcion esservidoradulto: Indica si es un servidor de adultos o no. *
		/*	Parametros: ninguno													*
		/*	Retorna: true si es un servidor de adultos, false si no lo es.		*
		/***********************************************************************/
		this.esservidoradulto= function () {
			return false;
		}
		
		/****************************************************************************
		/*	funcion geturl_video: Devuelve la url del video.						*
		/*	Parametros:																*
		/*		url_servidor: direccion de la que se debe extraer la url del video.	*	
		/*	Retorna: String que representa la url del video o 'error'				*									*
		/***************************************************************************/
		this.geturl_video= function (url_servidor)	{
			
			var vidInfoTypes = new Array('&el=embedded', '&el=detailpage', '&el=vevo', '');
			var vidId = url_servidor.replace('http://www.youtube.com/watch?v=','');
			vidId = vidId.replace('https://www.youtube.com/watch?v=','');
			
			var ytCypherUsed=false;
			var file_contents;
			
			for (var i=0;i<vidInfoTypes.length;i++)
				{
				file_contents = get_urlsource('http://www.youtube.com/get_video_info?&video_id=' + vidId + vidInfoTypes[i] + '&ps=default&eurl=&gl=US&hl=en');
				if (file_contents.indexOf('status=ok')>0)
					{
					if(file_contents.indexOf('use_cipher_signature=True')>0)
						{
						ytCypherUsed=true;
						break;									
						}
					}
				}
			//showtime.trace ('Youtube cypher=' + ytCypherUsed);
			
			file_contents = get_urlsource(url_servidor);
			var aux_string = extraer_texto(file_contents,'"url_encoded_fmt_stream_map":',':');
			//var aux_string = extraer_texto(file_contents,'"adaptive_fmts":',':');
			aux_string = extraer_texto(aux_string,'"','",');
			var aux_array = aux_string.split(',');
			var itag;
			var yt_url;
			var signature;
			
			var pos_ini;
			var pos_fin;
			var yt_urls=[];	
			for (i=0;i<aux_array.length;i++)
				{
				pos_ini = aux_array[i].indexOf('itag=');
				pos_fin = aux_array[i].indexOf('\\u0026',pos_ini);
				(pos_fin>-1) ? itag = aux_array[i].substr(pos_ini,pos_fin-pos_ini) : itag = aux_array[i].substr(pos_ini);

				pos_ini = aux_array[i].indexOf('url=');
				pos_fin = aux_array[i].indexOf('\\u0026',pos_ini);
				(pos_fin>-1) ? yt_url = aux_array[i].substr(pos_ini,pos_fin-pos_ini) : yt_url = aux_array[i].substr(pos_ini);

				pos_ini = aux_array[i].indexOf('u0026s=');
				pos_fin = aux_array[i].indexOf('\\u0026',pos_ini);
				(pos_fin>-1) ? signature = aux_array[i].substr(pos_ini,pos_fin-pos_ini) : signature = aux_array[i].substr(pos_ini);
				
				var params = {
						'itag': parseInt(itag.substr(5)),
						'signature': signature.substr(7),
						'url': unescape(yt_url.substr(4))};
				yt_urls.push(params);
				}
				
			yt_urls.sortBy('itag');
			 
			var url_video = 'error';
			var indice=0;
			for (i=0;i<yt_urls.length;i++)
				{
				if(yt_urls[i].itag==18)
					{
					indice=i;
					}
				if(yt_urls[i].itag==22) //720p
					{
					indice=i;
					break;
					}
				}					

			//Si es contenido protegido recomponer la firma
			if(ytCypherUsed==true)
				{
				var signature_parcheada = get_urlsource('http://rantanplan.net46.net/takata/index.php?kk=' + yt_urls[indice].signature);
				signature_parcheada = signature_parcheada.substr(0,signature_parcheada.indexOf('\n'));
				yt_urls[indice].url = yt_urls[indice].url + '&signature=' + signature_parcheada;

				//showtime.trace(yt_urls[indice].signature);
				//showtime.trace(signature_parcheada);
				}
			
			url_video = yt_urls[indice].url;
			//showtime.trace (url_video) + ' ' + yt_urls[indice].itag;

		return url_video;
		}
		
	}
	HostFactory.registrarHost("youtube",Youtube); //Registrar la clase Youtube
	
//servidores de video
//


//
//servidores de contenidos
	/********************************************************************************************************	
	/* var CanalFactory: AbstractFactory, patron de creacion de objetos del tipo Canal (servidores de 		*
	/*					contenidos)																			*
	/* 	para mas informacion vease: 																		*
	/*	http://www.elclubdelprogramador.com/2013/08/29/javascript-patrones-en-javascript-factory-pattern/	*
	/*	http://es.wikipedia.org/wiki/Abstract_Factory														*
	/*																										*
	/*	Ofrece los siguiente metodos estaticos:																*
	/*		- CanalFactory.registrarCanal(tipo,clase)														*
	/*		Para poder crear objetos de una clase determinada esta ha de haber sido previamente 			*
	/*		registrada mediante este metodo, donde tipo es un String que identifica a la clase, y clase es 	*
	/*		el nombre de la clase tal y como esta definida.													*
	/*		- CanalFactory.createCanal (tipo)																*
	/*		Metodo que crea una instancia de la clase tipo heredera de Canal.								*															*
	/*		Retorna: Una instancia de Canal o null															*	
	/*		- CanalFactory.getListadoCanales (categoria)													*
	/*		Metodo que retorna un listado de las clases registradas pertenecientes a la categoria pasada 	*
	/*		como parametro.																					*
	/*******************************************************************************************************/
	var CanalFactory = (function () {
		// almacen de clases Canal registradas
		var clasesRegistradas = {};

		return {
			createCanal: function (tipo)
			{
				var clase = clasesRegistradas[tipo.toLowerCase().replace(/\W|\_/g,'')];
				if(clase)
				{
						//Herencia
						if (clase.padre)
						{
							var clasePadre = clasesRegistradas[clase.padre.toLowerCase().replace(/\W|\_/g,'')];
							if (clasePadre) 
							{
								clasePadre.prototype= new Canal();
								clase.prototype= new clasePadre();
							}else{
								clase.prototype= new Canal();
							}
						}else{
							clase.prototype= new Canal();
						}
					var nuevaClase= new clase;
					nuevaClase.categoria= clase.categoria();
					nuevaClase.name=tipo;

					return nuevaClase;
				}else{
					return null;
				}

			},
			registrarCanal: function ( tipo, clase ) 
			{
				tipo=tipo.toLowerCase().replace(/\W|\_/g,'');
				clasesRegistradas[tipo] = clase;
				return CanalFactory;
			},
			getListadoCanales: function (categoria)
			{
				var listado=[];
				var tipo;
				for (tipo in clasesRegistradas)
				{
					if (clasesRegistradas[tipo].categoria() == categoria)
						listado.push(clasesRegistradas[tipo].getitem());
				}
				return listado;
			}
		};
	})();

	/********************************************************************************	
	/* var Canal: Objeto que representa un servidor de contenidos generico del que	*
	/* heredan el resto de servidores. Es el origen de los listados de peliculas,	*
	/* series, etc.. en el menu. Por ejemplo: peliculascoco, seriesyonkis, etc...	*
	/*	Propiedades publicas:			 											*
	/*		item_Actual,name															* 
	/* 	Metodos Publicos implementados:												*
	/*		cuadroBuscar(text)														*
	/* 	Metodos Publicos redefinidos en las subclases:								*
	/*		getmenu(), getplaylist(page, tipo, url), getservidores(url),			*
	/*		geturl_host(url), getitem_alfabeto() 									*
	/*******************************************************************************/
	var Canal= function() {
		//Propiedades
		this.item_Actual;
		this.name;
		this.categoria; //peliculas, series, anime, etc...


		//Metodos Publicos
		/****************************************************************************
		/*	funcion cuadroBuscar: Muestra el cuadro de dialogo 'Buscar'. 			*
		/*	Parametros: 															*
		/*		text (OPCIONAL): Cadena de texto a mostrar en el titulo del cuadro	*
		/*	Retorna: Un String con el texto introducido en el cuadro o undefined	*
		/*			si se ha cancelado.												*
		/***************************************************************************/
		this.cuadroBuscar= function(text) {	
			var texto_busqueda;
			var search = showtime.textDialog(text?text:'Buscar: ', true, true);
			if ((!search.rejected) && (search.input.length > 0)) texto_busqueda=search.input;

			return texto_busqueda;
		}

		//Metodos Publicos que seran redefinidos por las clases herederas
		/************************************************************************
		/*	funcion getmenu: Devuelve un listado de las subsecciones del canal. *
		/*	Parametros: ninguno													*
		/*	Retorna: Array de objetos Item_menu									*
		/************************************************************************/
		this.getmenu= function(){return [];}

		/************************************************************************************
		/*	funcion getplaylist: Devuelve un listado del contenido de las subsecciones.     *
		/*	Parametros: 																    *
		/*		page: referencia a la pagina de showtime desde donde se llama a la funcion. * 																*
		/*		tipo: especifica los diferentes tipos de listas soportados por el canal.    *
		/*		url: direccion de la que se debe extraer la lista.							*
		/*	Retorna: Array de objetos Item_menu											    *
		/************************************************************************************/
		this.getplaylist= function (page, tipo, url) {return [];}

		/************************************************************************************
		/*	funcion getservidores: Devuelve un listado de enlaces al contenido en los 		*
		/*							servidores soportados. 								    *
		/*	Parametros: 																    *
		/*		url: direccion de la que se debe extraer la lista.							*
		/*	Retorna: Array de servidores												    *
		/************************************************************************************/
		this.getservidores= function (url) {return [];}

		/****************************************************************************
		/*	funcion geturl_host: Devuelve la url del host donde se aloja el video.	*
		/*	Parametros:																*
		/*		url: direccion de la que se debe extraer la lista.					*
		/*	Retorna: String que representa la url									*
		/***************************************************************************/
		this.geturl_host= function (url){return url;}

		/************************************************************************************
		/*	funcion getitem_alfabeto: Devuelve un listado de las subsecciones del canal. 	*
		/*	Parametros: ninguno																*
		/*	Retorna:Un objetos Item_menu													*
		/***********************************************************************************/
		this.getitem_alfabeto= function() {return {};}

	}	


	/****************************************************************************
	/* var Newpct: Objeto que representa el canal NewPCT en Peliculas	*
	/****************************************************************************/
	var Newpct= function () {	
		var that=this; //Permite el acceso a metodos publicos desde metodos privados (closures): that.metodo_publico()

		//metodos publicos

		/************************************************************************
		/*	funcion getmenu: Devuelve un listado de las subsecciones del canal. *
		/*	Parametros: ninguno													*
		/*	Retorna: Array de objetos Item_menu									*
		/************************************************************************/
		this.getmenu= function(){
		//retorna el Menu
			var array_menu=[
				new Item_menu('Br-Dvd Castellano','views/img/folder.png',':vercontenido:newpct:tipobrdvd:'+ escape('http://www.newpct1.com/peliculas-castellano/peliculas-rip/')),
				new Item_menu('Estrenos de Cine','views/img/folder.png',':vercontenido:newpct:tipoestrenoscine:' + escape('http://www.newpct1.com/peliculas-castellano/estrenos-de-cine/;1')),
				new Item_menu('V.O. Subtituladas','views/img/folder.png',':vercontenido:newpct:tipovo:' + escape('http://www.newpct1.com/peliculas-vo/;1')),
				new Item_menu('Buscar','views/img/search.png',':vercontenido:newpct:tipobusqueda:' + escape('http://www.newpct1.com/buscar-descargas/'))
			];

			return array_menu;
		}

		/************************************************************************************
		/*	funcion getplaylist: Devuelve un listado del contenido de las subsecciones.     *
		/*	Parametros: 																    *
		/*		page: referencia a la pagina de showtime desde donde se llama a la funcion. * 																*
		/*		tipo: especifica los diferentes tipos de listas soportados por el canal.    *
		/*		url: direccion de la que se debe extraer la lista.							*
		/*	Retorna: Array de objetos Item_menu											    *
		/************************************************************************************/
		this.getplaylist= function (page, tipo, url) {
		//Retorna el playlist del tipo solicitado


		var array_playlist=[];
		switch (tipo)
			{
			case "tipobrdvd":
				page.metadata.title = "NewPct - Br-Dvd Castellano";
				var url_2=escape('http://www.newpct1.com/include.inc/ajax.php/orderCategory.php?type=todo&leter=&sql=SELECT+DISTINCT+++%09%09%09%09%09%09torrentID%2C+++%09%09%09%09%09%09torrentCategoryID%2C+++%09%09%09%09%09%09torrentCategoryIDR%2C+++%09%09%09%09%09%09torrentImageID%2C+++%09%09%09%09%09%09torrentName%2C+++%09%09%09%09%09%09guid%2C+++%09%09%09%09%09%09torrentShortName%2C++%09%09%09%09%09%09torrentLanguage%2C++%09%09%09%09%09%09torrentSize%2C++%09%09%09%09%09%09calidad+as+calidad_%2C++%09%09%09%09%09%09torrentDescription%2C++%09%09%09%09%09%09torrentViews%2C++%09%09%09%09%09%09rating%2C++%09%09%09%09%09%09n_votos%2C++%09%09%09%09%09%09vistas_hoy%2C++%09%09%09%09%09%09vistas_ayer%2C++%09%09%09%09%09%09vistas_semana%2C++%09%09%09%09%09%09vistas_mes++%09%09%09%09++FROM+torrentsFiles+as+t+WHERE++(torrentStatus+%3D+1+OR+torrentStatus+%3D+2)++AND+(torrentCategoryID+IN+(1537%2C+758%2C+1105%2C+760%2C+1225))++AND+home_active+%3D+0++++ORDER+BY+torrentDateAdded++DESC++LIMIT+0%2C+50&pag=1&tot=&ban=3&cate=1225');
				var params={'url_servidor': unescape(url_2),
					'page_uri': ':verenlaces:newpct:',
					'uri_siguiente': ':vercontenido:newpct:tipo1:',
					'subtitulo':false}	
				array_playlist=this.parsenewpcttipodefault(url,params);
				break;
			case "tipoestrenoscine":
				page.metadata.title = "NewPct - Estrenos de Cine";
				var url_2=escape('http://www.newpct1.com/include.inc/ajax.php/orderCategory.php?type=todo&leter=&sql=SELECT+DISTINCT+++%09%09%09%09%09%09torrentID%2C+++%09%09%09%09%09%09torrentCategoryID%2C+++%09%09%09%09%09%09torrentCategoryIDR%2C+++%09%09%09%09%09%09torrentImageID%2C+++%09%09%09%09%09%09torrentName%2C+++%09%09%09%09%09%09guid%2C+++%09%09%09%09%09%09torrentShortName%2C++%09%09%09%09%09%09torrentLanguage%2C++%09%09%09%09%09%09torrentSize%2C++%09%09%09%09%09%09calidad+as+calidad_%2C++%09%09%09%09%09%09torrentDescription%2C++%09%09%09%09%09%09torrentViews%2C++%09%09%09%09%09%09rating%2C++%09%09%09%09%09%09n_votos%2C++%09%09%09%09%09%09vistas_hoy%2C++%09%09%09%09%09%09vistas_ayer%2C++%09%09%09%09%09%09vistas_semana%2C++%09%09%09%09%09%09vistas_mes++%09%09%09%09++FROM+torrentsFiles+as+t+WHERE++(torrentStatus+%3D+1+OR+torrentStatus+%3D+2)++AND+(torrentCategoryID+IN+(1231%2C+1165%2C+1230%2C+1232%2C+766%2C+765%2C+761%2C+848%2C+1224))++AND+home_active+%3D+0++++ORDER+BY+torrentDateAdded++DESC++LIMIT+0%2C+50&pag=1&tot=&ban=3&cate=1224');
				var params={'url_servidor': unescape(url_2),
					'page_uri': ':verenlaces:newpct:',
					'uri_siguiente': ':vercontenido:newpct:tipo1:',
					'subtitulo':false}	
				array_playlist=this.parsenewpcttipodefault(url,params);
				break;
			case "tipovo":
				page.metadata.title = "NewPct - V.O. Subtituladas";
				var url_2=escape('http://www.newpct1.com/include.inc/ajax.php/orderCategory.php?type=todo&leter=&sql=SELECT+DISTINCT+++%09%09%09%09%09%09torrentID%2C+++%09%09%09%09%09%09torrentCategoryID%2C+++%09%09%09%09%09%09torrentCategoryIDR%2C+++%09%09%09%09%09%09torrentImageID%2C+++%09%09%09%09%09%09torrentName%2C+++%09%09%09%09%09%09guid%2C+++%09%09%09%09%09%09torrentShortName%2C++%09%09%09%09%09%09torrentLanguage%2C++%09%09%09%09%09%09torrentSize%2C++%09%09%09%09%09%09calidad+as+calidad_%2C++%09%09%09%09%09%09torrentDescription%2C++%09%09%09%09%09%09torrentViews%2C++%09%09%09%09%09%09rating%2C++%09%09%09%09%09%09n_votos%2C++%09%09%09%09%09%09vistas_hoy%2C++%09%09%09%09%09%09vistas_ayer%2C++%09%09%09%09%09%09vistas_semana%2C++%09%09%09%09%09%09vistas_mes++%09%09%09%09++FROM+torrentsFiles+as+t+WHERE++(torrentStatus+%3D+1+OR+torrentStatus+%3D+2)++AND+(torrentCategoryID+IN+(779%2C+784%2C+787%2C+788%2C+786%2C+778))++AND+home_active+%3D+0++++ORDER+BY+torrentDateAdded++DESC++LIMIT+0%2C+50&pag=1&tot=&ban=3&cate=778');
				var params={'url_servidor': unescape(url_2),
					'page_uri': ':verenlaces:newpct:',
					'uri_siguiente': ':vercontenido:newpct:tipo1:',
					'subtitulo':false}	
				array_playlist=this.parsenewpcttipodefault(url,params);
				break;
			case "tipo1":
				//array_playlist=parsenewpctpeliculastipo1(page,url);
				var params={'url_servidor': unescape(url),
					'page_uri': ':verenlaces:newpct:',
					'uri_siguiente': ':vercontenido:newpct:tipo1:',
					'subtitulo':false}	
				array_playlist= that.parsenewpct (params);
				break;
			case "tipobusqueda":
				page.metadata.title = "NewPct - Buscar - "; 
				array_playlist=this.parsenewpcttipobusqueda(page,url);
				break;
			}
		return array_playlist;
		}

		/************************************************************************************
		/*	funcion getservidores: Devuelve un listado de enlaces a la pelicula en los 		*
		/*							servidores soportados. 								    *
		/*	Parametros: 																    *
		/*		url: direccion de la que se debe extraer la lista.							*
		/*	Retorna: Array de servidores												    *
		/************************************************************************************/
		// Antes function parsenewpctpelicula
		this.getservidores= function (url)
		{
		url=unescape(url);
		var file_contents = get_urlsource(url);
		var array_servidores=[];

		var titulo;
		var imagen;
		var url_host;
		var servidor;
		var idioma;
		var calidad;
		var descripcion;

		//check login

		file_contents = that.checkloginnewpct(url, file_contents);
		if(file_contents!=false)
			{
			//item_Actual
			titulo = extraer_texto(file_contents ,'<h2 class="title" id="title_ficha" itemprop="name">','</h2>');
			titulo = extraer_texto(titulo ,'">','</a>');
			imagen = extraer_texto(file_contents ,'<meta property="og:image" content="','" />');
			descripcion = extraer_texto(file_contents ,"<div class='sinopsis'>","</div>");

			this.item_Actual=new Item_menu(titulo,imagen,null,url,descripcion);


			file_contents = extraer_texto(file_contents,"<thead id='ver-online'>","</table>");
			file_contents = extraer_texto(file_contents,'<tbody>','</tbody>');
			//<tr to </tr>
			var array_aux = extraer_html_array(file_contents,'<tr','</tr>');
			file_contents = "";


			var array_aux2=[];
			for (var i=0;i<array_aux.length;i++)
				{
				if(array_aux[i].indexOf('<td>ver en 1 Link</td>')!='-1')
					{
					url_host = extraer_texto(array_aux[i],"<a href='","'");
					array_aux2 = extraer_html_array(array_aux[i],'<td>','</td>');
					servidor = extraer_texto(array_aux2[0],'<td>','</td>');	
					idioma = extraer_texto(array_aux2[1],'<td>','</td>');
					calidad = extraer_texto(array_aux2[2],'<td>','</td>');

					var params={
							"url_host" : url_host,
							"servidor" : servidor,
							"idioma" : idioma,
							"calidad" : calidad
							};

					var objHost=HostFactory.createHost(servidor,params)
					if (objHost)
						{ 
							array_servidores.push(objHost);
						} 
					}
				}

			}
		return array_servidores;
		}

		/****************************************************************************
		/*	funcion geturl_host: Devuelve la url del host donde se aloja el video.	*
		/*	Parametros:																*
		/*		url: direccion de la que se debe extraer la lista.					*
		/*	Retorna: String que representa la url									*
		/***************************************************************************/
		this.geturl_host= function (url){
			return url;	
		}


		//Estos metodos son publicos para poder acceder desde los herederos
		this.checkloginnewpct= function (url_servidor, file_contents)
		{
		var logueado = file_contents.indexOf("//loadtopBar('');")
		var valor_retorno=false;
		if(logueado!=-1) //no logueado
			{
			var reason = 'Introduce tu usuario y contraseña de http://www.newpct.com';
			var do_query = false;
			while(1)
				{
				var credentials = plugin.getAuthCredentials("NewPct", reason, do_query, 'newpct');
				if(!credentials)
					{
					if(!do_query)
						{
						do_query = true;
						continue;
						}
					break;
					}
				if (credentials.rejected) {break;}
				if (credentials.username == "" || credentials.password == "")
					{
					if (!do_query)
						{
						do_query = true;
						continue;
						}
					break;
					}

				try
					{
					var datos_post = {'userName': credentials.username,'userPass': credentials.password};
					file_contents = post_urlsource('http://www.newpct1.com/entrar',datos_post);
					var usuario = extraer_texto(file_contents,"loadtopBar('","'");
					if(usuario!='')
						{
						if(do_query == true) {showtime.notify('Logueado en NewPct como: ' + credentials.username, 3);}
						valor_retorno = get_urlsource(url_servidor);
						break;
						}
					else
						{
						reason = "Usuario/Contraseña Incorrecta.";
						continue;
						}
					}
					catch (ex) { e(ex); showtime.trace('NewPct: error al autenticarse.'); break; }
				}
			}
		else {valor_retorno = file_contents;} //logueado

		return valor_retorno;
		}


		this.parsenewpct= function (params) 
		{	
		/*var params={'url_servidor': ,'page_uri': ,'uri_siguiente': ,'subtitulo': }*/
		var numero_pagina = parseInt(extraer_texto(params.url_servidor,'pag=','&'));			
		var file_contents = get_urlsource(params.url_servidor);

		var ultima_pagina = extraer_texto(file_contents,"<div id='centPag'>","</div>");
		ultima_pagina = ultima_pagina.substr(ultima_pagina.lastIndexOf("<a href='javascript:;'  class='todo'  onclick=\"orderCategory('todo','','"));
		ultima_pagina = extraer_texto(ultima_pagina,"<a href='javascript:;'  class='todo'  onclick=\"orderCategory('todo','','","'");
		var array_aux = extraer_html_array(file_contents,'<li>','</li>');
		file_contents = "";

		var titulo;
		var imagen;
		var url_video;
		var array_playlist=[];

		for (var i=0;i<array_aux.length;i++)
			{
			titulo=extraer_texto(array_aux[i],'<h3>','</h3>');
			if (params.subtitulo) titulo=titulo + ' ' + extraer_texto(array_aux[i],'<p>','<br/>');
			if (titulo !='') {			
				imagen=extraer_texto(array_aux[i],"<img src='","'");
				url_video=extraer_texto(array_aux[i],"<a href='","'>");
				array_playlist.push(new Item_menu(titulo,imagen,params.page_uri,url_video));
				}
			}

		//paginador
		var pagina_siguiente = (parseInt(numero_pagina) + 1);
		if(numero_pagina<ultima_pagina)
			{
				array_playlist.push(new Item_menu('Siguiente',"views/img/siguiente.png",params.uri_siguiente,params.url_servidor.replace('pag=' + numero_pagina,'pag=' + pagina_siguiente)));		
			}

		return array_playlist;
		}

		this.parsenewpcttipobusqueda = function(page, url_servidor, op_categoria)
		{
		//aqui no voy a usar el checklogin para evitar q se de el caso de dos inputs uno detras de otro
		url_servidor=unescape(url_servidor);
		var array_playlist=[];

		op_categoria= op_categoria || 757;// Por defecto 757 Peliculas, sino: 1469 series HD,  767 Series
		var texto_busqueda= this.cuadroBuscar();

		if(texto_busqueda != undefined)
			{
			var datos_post = 
				{
				'cID': 0, 'tLang': 0, 'oBy': 0,	'oMode': 0, 'category_': op_categoria, 'subcategory_' : 'All',
				'idioma_': 'All', 'calidad_': 'All', 'oByAux': 0, 'oModeAux': 0, 'size_': 0,
				'q': texto_busqueda, 'btnb': 'Filtrar+Busqueda'
				};
			var file_contents = post_urlsource(url_servidor,datos_post);
			var resultados = file_contents.indexOf('No hemos encontrado resultados');

			page.metadata.title = page.metadata.title + texto_busqueda;

			if(resultados==-1)
				{
				var aux_string = extraer_texto(file_contents ,'<tbody>','</tbody>');
				var array_aux = extraer_html_array(aux_string,'<tr>','</tr>');
				array_aux.sort();

				var titulo;
				var imagen = "views/img/folder.png";
				var url_video;
				var page_uri = ':verenlaces:' + this.name + ':';

				for (var i=0;i<array_aux.length;i++)
					{
					if(array_aux[i].indexOf('<td class="center tdpagination" colspan="4">')==-1)
						{
						titulo=extraer_texto(array_aux[i],'title="Descargar ','"');
						url_video=extraer_texto(array_aux[i],'<a href="','"');

						array_playlist.push(new Item_menu(titulo,imagen,page_uri,url_video));
						}
					}
				}
			//devuelve bastantes resultados no veo necesario usar paginas
			}

		return array_playlist;
		}


		this.parsenewpcttipodefault = function(url_servidor,params){
			url_servidor=unescape(url_servidor);
			var array_playlist=[];

			var file_contents = get_urlsource(url_servidor);
			//check_login
			file_contents = that.checkloginnewpct(url_servidor, file_contents);
			if(file_contents!=false) array_playlist= this.parsenewpct (params);

		return array_playlist;
		}


	}
	//Propiedades y metodos Estaticos
	Newpct.categoria= function() {return 'peliculas';}
	Newpct.getitem= function() {return new Item_menu('NewPCT',"img/newpct.png",':vercanales:newpct');}

	CanalFactory.registrarCanal("newpct",Newpct); //Registrar la clase Newpct

	/****************************************************************************************
	/* var Peliculaspepito: Objeto que representa el canal Peliculas Pepito en Peliculas	*
	/****************************************************************************************/
	var Peliculaspepito= function() {	
		var that=this; //Permite el acceso a metodos publicos desde metodos privados (closures): that.metodo_publico()
		//metodos publicos

		/************************************************************************
		/*	funcion getmenu: Devuelve un listado de las subsecciones del canal. *
		/*	Parametros: ninguno													*
		/*	Retorna: Array de objetos Item_menu									*
		/************************************************************************/
		this.getmenu= function(){
		//retorna el Menu
			var array_menu=[
				new Item_menu('Ultimos estrenos en cine','views/img/folder.png',':vercontenido:peliculaspepito:tipoultimosestrenos:' + escape('http://www.peliculaspepito.com')),
				new Item_menu('Nuevo Contenido','views/img/folder.png',':vercontenido:peliculaspepito:tiponuevocontenido:' + escape('http://www.peliculaspepito.com')),
				new Item_menu('Lo mas visto','views/img/folder.png',':vercontenido:peliculaspepito:tipolomasvisto:' + escape('http://www.peliculaspepito.com')),
				new Item_menu('Lo mas popular','views/img/folder.png',':vercontenido:peliculaspepito:tipolomasvotado:' + escape('http://www.peliculaspepito.com')),
				new Item_menu('Orden Alfabetico','views/img/folder.png',':alfabeto:peliculaspepito:num'),
				new Item_menu('Buscar','views/img/search.png',':vercontenido:peliculaspepito:tipobusqueda:' + escape('http://www.peliculaspepito.com/buscador'))
				];

			return array_menu;
		}

		/************************************************************************************
		/*	funcion getplaylist: Devuelve un listado del contenido de las subsecciones.     *
		/*	Parametros: 																    *
		/*		page: referencia a la pagina de showtime desde donde se llama a la funcion. * 																*
		/*		tipo: especifica los diferentes tipos de listas soportados por el canal.    *
		/*		url: direccion de la que se debe extraer la lista.							*
		/*	Retorna: Array de objetos Item_menu											    *
		/************************************************************************************/
		this.getplaylist= function (page, tipo, url) {
			var array_playlist=[];
			switch (tipo)
				{
				case "tipoultimosestrenos":
					array_playlist=parsepeliculaspepitotipo1(url, 'ultimosestrenos', page);
					break;
				case "tiponuevocontenido":
					array_playlist=parsepeliculaspepitotipo1(url, 'nuevocontenido', page);
					break;
				case "tipolomasvisto":
					array_playlist=parsepeliculaspepitotipo1(url, 'masvisto', page);
					break;
				case "tipolomasvotado":
					array_playlist=parsepeliculaspepitotipo1(url, 'masvotado', page);
					break;
				case "tipobusqueda":
					array_playlist=parsepeliculaspepitotipobusqueda(url, page);
					break;
				case "tipolistado":
					array_playlist=parsepeliculaspepitotipolistado(url);
					break;	
				}	
		return array_playlist;
		}

		/************************************************************************************
		/*	funcion getservidores: Devuelve un listado de enlaces a la pelicula en los 		*
		/*							servidores soportados. 								    *
		/*	Parametros: 																    *
		/*		url: direccion de la que se debe extraer la lista.							*
		/*	Retorna: Array de servidores												    *
		/************************************************************************************/
		this.getservidores= function (url)
		{
			url=unescape(url);
			var file_contents = get_urlsource(url);
			var aux_string = extraer_texto(file_contents, '<div id="ph_caratula">','<div id="ph_menu"');

			var titulo;
			var imagen;
			var url_host;
			var servidor;
			var idioma;
			var calidad;
			var descripcion;

			//item_Actual
			titulo = extraer_texto(aux_string, '<h1>','</h1>');
			imagen = extraer_texto(aux_string, 'src="','"');
			descripcion = extraer_texto(aux_string ,'<div id="ph_sinopsis">','</div>');
			descripcion = descripcion.replace(/<p>/g,'');
			descripcion = descripcion.replace(/<\/p>/g,'');
			descripcion = descripcion.replace(/<div class="ficha_peli"><span>/g,'');
			descripcion = descripcion.replace(/<\/span>/g,'');

			this.item_Actual=new Item_menu(titulo,imagen,null,url,descripcion);	

			aux_string = extraer_texto(file_contents, '</thead>','</table>');
			file_contents = "";

			var array_aux = extraer_html_array(aux_string,'<tr>','</tr>');

			var array_servidores=[];

			for (var i=0;i<array_aux.length;i++)
				{
				url_host=extraer_texto(array_aux[i],'href="','"');
				servidor = extraer_texto(array_aux[i],'alt="','"');
				idioma = extraer_texto(array_aux[i],'<span class="flag ','"');
				switch (idioma)
					{
					case "flag_0":
						idioma='Español';
						break;
					case "flag_1":
						idioma='Latino';
						break;
					case "flag_2":
						idioma='Ingles';
						break;
					case "flag_3":
						idioma='Ingles Subtitulado';
						break;
					}
				calidad = extraer_texto(array_aux[i],'class="tdcalidad">','</td>').replace(/&nbsp;/g,' ');

				var params={
							"url_host" : url_host,
							"servidor" : servidor,
							"idioma" : idioma,
							"calidad" : calidad
							};

					var objHost=HostFactory.createHost(servidor,params)
					if (objHost)
						{
							array_servidores.push(objHost);
						}				
				}
			array_servidores.sortBy('idioma');
			return array_servidores;
		}

		/****************************************************************************
		/*	funcion geturl_host: Devuelve la url del host donde se aloja el video	*
		/*					 Sustituye a resolveXXXXXXpelicula(url)					*
		/*	Parametros:																*
		/*		url: direccion de la que se debe extraer la lista.					*
		/*	Retorna: String que representa la url									*
		/***************************************************************************/
		this.geturl_host= function (url){
			return extraer_texto(get_urlsource(url),'title="Bajar..." href="','">'); 
		}

		/************************************************************************************
		/*	funcion getitem_alfabeto: Devuelve un listado de las subsecciones del canal. 	*
		/*	Parametros: ninguno																*
		/*	Retorna:Un objetos Item_menu													*
		/***********************************************************************************/
		this.getitem_alfabeto= function() {
			return (new Item_menu("Peliculas Pepito - Orden Alfabetico","views/img/folder.png",':vercontenido:peliculaspepito:tipolistado:','http://www.peliculaspepito.com/lista-peliculas/'))
		}

		//Metodos Privados

	function parsepeliculaspepitotipo1(url_servidor, tipo, page)
		{
		//http://www.peliculaspepito.com (ultimosestrenoscine,nuevocontenido,masvisto,masvotado)
		url_servidor=unescape(url_servidor);
		var titulo_pagina;
		var corte_string;
		switch (tipo)
				{
				case "ultimosestrenos":
					titulo_pagina = 'Ultimos Estrenos Cine';
					corte_string = 'ltimos estrenos en cines';
				break;
				case "nuevocontenido":
					titulo_pagina = 'Nuevo Contenido';
					corte_string = 'uevos contenidos';
				break;
				case "masvisto":
					titulo_pagina = 'Lo Mas Visto';
					corte_string = 's visto ayer';
				break;
				case "masvotado":
					titulo_pagina = 'Lo Mas Popular';
					corte_string = 'mas gustado en PeliculasPepito';
				break;
				}
		page.metadata.title = 'Peliculas Pepito - ' + titulo_pagina;


		var file_contents = get_urlsource(url_servidor);
		var aux_string = extraer_texto(file_contents, corte_string, '</ul>');
		var array_aux = extraer_html_array(aux_string,'<li>','</li>');

		var titulo;
		var imagen;
		var url_video;	
		var page_uri = ':verenlaces:peliculaspepito:';
		var array_playlist=[];

		for (var i=0;i<array_aux.length;i++)
			{
			titulo=extraer_texto(array_aux[i],'title="','"');
			imagen=extraer_texto(array_aux[i],'src="','"');
			url_video=extraer_texto(array_aux[i],'href="','"');
			array_playlist.push(new Item_menu(titulo,imagen,page_uri,url_video));	
			}

		return array_playlist;
		}

	function parsepeliculaspepitotipolistado(url_servidor)
		{
		url_servidor=unescape(url_servidor) + '/';
		var file_contents = get_urlsource(url_servidor);

		var aux_string = extraer_texto(file_contents,'<ul class="ullistadoalfa">','</ul>');
		var array_aux = extraer_html_array(aux_string,'<li>','</li>');

		var titulo;
		var imagen = "views/img/folder.png";

		var url_video;   
		var page_uri = ':verenlaces:peliculaspepito:';

		var array_playlist=[];

		for (var i=0;i<array_aux.length;i++)
		{
			titulo=extraer_texto(array_aux[i],'title="','"');
			url_video=extraer_texto(array_aux[i],'href="','"');
			array_playlist.push(new Item_menu(titulo,imagen,page_uri,url_video));	
		}

		return array_playlist;
		}

	function parsepeliculaspepitotipobusqueda(url_servidor, page)
		{
		url_servidor=unescape(url_servidor);
		var array_playlist=[];
		var texto_busqueda=that.cuadroBuscar();

		if ( texto_busqueda != undefined) 
			{	
				texto_busqueda = texto_busqueda.replace(/ /g,'-');

				page.metadata.title = 'Peliculas Pepito - Buscar ' + texto_busqueda;

				var file_contents = get_urlsource(url_servidor + '/' + texto_busqueda + '/');

				var resultados = file_contents.indexOf('o hemos encontrado');
				if(resultados==-1)
				{
					var aux_string = extraer_texto(file_contents, 'lista_peliculas', '</ul>');
					var array_aux = extraer_html_array(aux_string,'<li>','</li>');

					var titulo;
					var imagen;
					var url_video;	
					var page_uri = ':verenlaces:peliculaspepito:';
					var array_playlist=[];

					for (var i=0;i<array_aux.length;i++)
						{
						titulo=extraer_texto(array_aux[i],'title="','"');
						imagen=extraer_texto(array_aux[i],'src="','"');
						url_video=extraer_texto(array_aux[i],'href="','"');

						array_playlist.push(new Item_menu(titulo,imagen,page_uri,url_video));		
						}
				}
			}

		return array_playlist;
		}

	}
	//Propiedades y metodos Estaticos
	Peliculaspepito.categoria= function() {return 'peliculas';}
	Peliculaspepito.getitem= function() {return new Item_menu('Peliculas Pepito',"img/peliculaspepito.png",':vercanales:peliculaspepito');}

	//CanalFactory.registrarCanal("Peliculaspepito",Peliculaspepito); //Registrar la clase Peliculaspepito

	/************************************************************************************************
	/* var Vodly: Objeto que representa el canal Vodly en Peliculas, y del que hereda Vodlyseries	*
	/***********************************************************************************************/
	var Vodly= function() {	
		var that=this; //Permite el acceso a metodos publicos desde metodos privados (closures): that.metodo_publico()
		//metodos publicos
		/************************************************************************
		/*	funcion getmenu: Devuelve un listado de las subsecciones del canal. *
		/*	Parametros: ninguno													*
		/*	Retorna: Array de objetos Item_menu									*
		/************************************************************************/
		this.getmenu= function(){
		//retorna el Menu
			var array_menu=[
				new Item_menu('Just Added','views/img/folder.png',':vercontenido:vodly:tipojustadd:' + escape('http://www.vodly.to/')),
				new Item_menu('Featured Movies','views/img/folder.png',':vercontenido:vodly:tipofeatured:' + escape('http://www.vodly.to/index.php?sort=featured')),
				new Item_menu('Popular Movies','views/img/folder.png',':vercontenido:vodly:tipopopular:' + escape('http://www.vodly.to/index.php?sort=views')),
				new Item_menu('Buscar','views/img/search.png',':vercontenido:vodly:tipobusqueda:' + escape('http://www.vodly.to/index.php?search_keywords='))
				];
		return array_menu;
		}

		/************************************************************************************
		/*	funcion getplaylist: Devuelve un listado del contenido de las subsecciones.     *
		/*	Parametros: 																    *
		/*		page: referencia a la pagina de showtime desde donde se llama a la funcion. * 																*
		/*		tipo: especifica los diferentes tipos de listas soportados por el canal.    *
		/*		url: direccion de la que se debe extraer la lista.							*
		/*	Retorna: Array de objetos Item_menu											    *
		/************************************************************************************/
		this.getplaylist= function (page, tipo, url) {
			var array_playlist=[];
			switch (tipo)
			{
				case "tipojustadd":
					page.metadata.title = "Vodly - Just Added";
					array_playlist=this.parsevodly(url,'peliculas');
					break;
				case "tipofeatured":
					page.metadata.title = "Vodly - Featured";
					array_playlist=this.parsevodly(url,'peliculas');
					break;
				case "tipopopular":
					page.metadata.title = "Vodly - Popular Movies";
					array_playlist=this.parsevodly(url,'peliculas');
					break;
				case "tipobusqueda":
					//http://www.vodly.to/index.php?search_keywords=robocop&search_section=1
					array_playlist=this.parsevodlytipobusqueda(page, url,'peliculas');
					break;
			}
		return array_playlist;
		}

		/****************************************************************************************
		/*	funcion getservidores: Devuelve un listado de enlaces a la pelicula en los 			*
		/*							servidores soportados. Sustituye a parseXXXXXpelicula (url)	*
		/*	Parametros: 																    	*
		/*		url: direccion de la que se debe extraer la lista.								*
		/*	Retorna: Array de servidores												    	*
		/****************************************************************************************/
		this.getservidores= function (url)
		{
			url=unescape(url);
			var file_contents = get_urlsource(url);

			var titulo;
			var imagen;
			var url_video;
			var servidor;
			var idioma;
			var calidad;
			var descripcion;

			//item_Actual
			titulo = extraer_texto(file_contents, '<div class="stage_navigation movie_navigation">','</div>');
			titulo = extraer_texto(titulo, '<a href="','a>');
			titulo = extraer_texto(titulo, 'name">','</');
			imagen = extraer_texto(file_contents, '<div class="movie_thumb"><img itemprop="image" src="','"');
			descripcion = extraer_texto(file_contents ,'<p style="width:460px; display:block;">','</p>');

			this.item_Actual=new Item_menu(titulo,imagen,null,url,descripcion);



			//aux_string = extraer_texto(file_contents, '</thead>','</table>');
			var array_aux = extraer_html_array(file_contents,'<table width="100%" cellpadding="0" cellspacing="0" class="movie_version','</table>');
			file_contents = "";

			var array_servidores=[];

			for (var i=0;i<array_aux.length;i++)
			{
				servidor = extraer_texto(array_aux[i],'<span class="version_host">','</span>').replace(/\n/g,'');
				servidor = servidor.substr(0,servidor.indexOf('.'));
				url_video = 'http://www.vodly.to' + extraer_texto(array_aux[i],'href="','"');
				idioma = 'Ingles';
				calidad = extraer_texto(array_aux[i],'<span class=quality_','></span><');

				var params={
						"url_host" : url_video,
						"servidor" : servidor,
						"idioma" : idioma,
						"calidad" : calidad
						};

				var objHost=HostFactory.createHost(servidor,params)
				if (objHost)
					{
						array_servidores.push(objHost);
					}				
			}

		return array_servidores;
		}

		/************************************************************************
		/*	funcion gethost: Devuelve la url del host donde se aloja el video	*
		/*					 Sustituye a resolveXXXXXXpelicula(url)				*
		/*	Parametros:															*
		/*		url: direccion de la que se debe extraer la lista.				*
		/*	Retorna: String que representa la url								*
		/************************************************************************/
		this.geturl_host= function (url){
			return get_urlheaders(url).headers['Location'];	
		}


		//Estos metodos son publicos para poder acceder desde Vodlyseries
		this.parsevodlytipobusqueda=function (page, url_servidor,tipo)
		{
			//http://www.vodly.to/index.php?search_keywords=(texto_busqueda)&search_section=1
			var array_playlist=[];
			var texto_busqueda=that.cuadroBuscar();
			if(texto_busqueda != undefined)
			{
				url_servidor=unescape(url_servidor);
				page.metadata.title = "Vodly - Buscar - " + texto_busqueda;	
				url_servidor=escape(unescape(url_servidor) + texto_busqueda + '&search_section=1'); 
				array_playlist=this.parsevodly(url_servidor,tipo);
			}
		return array_playlist;
		}

		this.parsevodly = function (url_servidor,tipo)
		{
			//http://www.vodly.to/
			//http://www.vodly.to/index.php?sort=featured
			//http://www.vodly.to/index.php?sort=views
			//http://www.vodly.to/index.php?search_keywords=(texto_busqueda)&search_section=1
			url_servidor=unescape(url_servidor);
			var file_contents = get_urlsource(url_servidor);
			var array_aux = extraer_html_array(file_contents,'<div class="index_item index_item_ie">','</div>');
			file_contents = "";

			var titulo;
			var imagen;
			var url_video;	
			var page_uri = ':verenlaces:vodly:';
			var array_playlist=[];
			var key;

			switch (tipo)
			{
				case "peliculas":
					key= 'http://vodly.to/watch-';
					break;
				case "series":
					key= 'http://www.vodly.to/tv-';
					page_uri = ':vercontenido:vodlyseries:tiposerie:';
					break;
			}

			for (var i=0;i<array_aux.length;i++)
			{
				titulo=extraer_texto(array_aux[i],'<h2>','</h2>');
				imagen=extraer_texto(array_aux[i],'<img src="','"');
				url_video=extraer_texto(array_aux[i],'<a href="','"');

				//filtrar si es serie o pelicula
				//si es serie empieza por tv- si es peli por watch-
				if(url_video.indexOf(key == 0))
				{
					array_playlist.push(new Item_menu(titulo,imagen,page_uri,url_video));	
				}
			}
		return array_playlist;
		}

	}
	//Propiedades y metodos Estaticos
	Vodly.categoria= function() {return 'peliculas';}
	Vodly.getitem= function() {return new Item_menu('Vodly',"img/vodly.png",':vercanales:vodly');}

	CanalFactory.registrarCanal("Vodly",Vodly); //Registrar la clase Vodly

	/************************************************************************************
	/* var PeliculasCoco: Objeto que representa el canal Peliculas Coco en Peliculas	*
	/************************************************************************************/
	var PeliculasCoco= function() {	
		//var that=this; //Permite el acceso a metodos publicos desde metodos privados (closures): that.metodo_publico()
		//metodos publicos

		/************************************************************************
		/*	funcion getmenu: Devuelve un listado de las subsecciones del canal. *
		/*	Parametros: ninguno													*
		/*	Retorna: Array de objetos Item_menu									*
		/************************************************************************/
		this.getmenu= function(){
		//retorna el Menu
			var array_menu=[
				new Item_menu('Estrenos','views/img/folder.png',':vercontenido:peliculascoco:estrenos:' + escape('http://www.peliculascoco.pro/index.php?do=cat&category=estrenos')),
				new Item_menu('Ultimo añadido','views/img/folder.png',':vercontenido:peliculascoco:ultimoadd:' + escape('http://www.peliculascoco.pro/index.php?do=cat&category=peliculas-online')),
				new Item_menu('V.O.S.','views/img/folder.png',':vercontenido:peliculascoco:vos:' + escape('http://www.peliculascoco.pro/index.php?do=cat&category=peliculas-vos')),
				new Item_menu('720p HD','views/img/folder.png',':vercontenido:peliculascoco:hd:' + escape('http://www.peliculascoco.pro/index.php?do=cat&category=hd'))
				];
		return array_menu;
		}

		/************************************************************************************
		/*	funcion getplaylist: Devuelve un listado del contenido de las subsecciones.     *
		/*	Parametros: 																    *
		/*		page: referencia a la pagina de showtime desde donde se llama a la funcion. * 																*
		/*		tipo: especifica los diferentes tipos de listas soportados por el canal.    *
		/*		url: direccion de la que se debe extraer la lista.							*
		/*	Retorna: Array de objetos Item_menu											    *
		/************************************************************************************/
		this.getplaylist= function (page, tipo, url) {
			var array_playlist=[];
			switch (tipo)
			{
				case "estrenos":
					page.metadata.title = 'Peliculas Coco - Estrenos';			
					array_playlist=parsepeliculascocotipo1(url);
					break;
				case "ultimoadd":
					page.metadata.title = 'Peliculas Coco - Ultimo Añadido';			
					array_playlist=parsepeliculascocotipo1(url);
					break;
				case "vos":
					page.metadata.title = 'Peliculas Coco - V.O.S.';			
					array_playlist=parsepeliculascocotipo1(url);
					break;
				case "hd":
					page.metadata.title = 'Peliculas Coco - HD';			
					array_playlist=parsepeliculascocotipo1(url);
					break;
			}	
		return array_playlist;
		}

		/****************************************************************************************
		/*	funcion getservidores: Devuelve un listado de enlaces a la pelicula en los 			*
		/*							servidores soportados. Sustituye a parseXXXXXpelicula (url)	*
		/*	Parametros: 																    	*
		/*		url: direccion de la que se debe extraer la lista.								*
		/*	Retorna: Array de servidores												    	*
		/****************************************************************************************/
		this.getservidores= function (url)
		{
			url=unescape(url);
			var file_contents = get_urlsource(url);

			var titulo;
			var imagen;
			var url_video;
			var servidor;
			var idioma;
			var calidad;
			var descripcion;

			//item_Actual
			titulo = extraer_texto(file_contents, '<meta property="og:title" content="','"');
			imagen = extraer_texto(file_contents, '<meta property="og:image" content="','"');
			descripcion = extraer_texto(file_contents ,'<span class="fn_more">','</span>');

			this.item_Actual=new Item_menu(titulo,imagen,null,url,descripcion);



			var aux_string = extraer_texto(file_contents, '<table>','</table>');
			var array_aux = extraer_html_array(aux_string,'</p>','frameborder="0"></iframe>');
			file_contents = "";

			var array_servidores=[];

			for (var i=0;i<array_aux.length;i++)
			{

				if(array_aux[i].indexOf('lang-full/spanish.png')>0) {idioma = 'Español'; }
				if(array_aux[i].indexOf('lang-full/latino.png')>0) {idioma = 'Latino'; }
				if(array_aux[i].indexOf('lang-full/vos.png')>0) {idioma = 'V.O.S.'; }
				url_video = extraer_texto(array_aux[i],'<iframe src="','"');

				if(url_video.indexOf('played.to')>0)
					{
					url_video = 'http://played.to/' + extraer_texto(url_video,'embed-','-');
					}

				servidor = extraer_texto(url_video.toLowerCase(),'//','/').replace('www.','');
				servidor = servidor.substr(0,servidor.lastIndexOf("."));

				var params={
						"url_host" : url_video,
						"servidor" : servidor,
						"idioma" : idioma,
						"calidad" : calidad
						};

				var objHost=HostFactory.createHost(servidor,params)
				if (objHost)
					{
						array_servidores.push(objHost);
					}				
			}

		return array_servidores;
		}

		/************************************************************************
		/*	funcion gethost: Devuelve la url del host donde se aloja el video	*
		/*					 Sustituye a resolveXXXXXXpelicula(url)				*
		/*	Parametros:															*
		/*		url: direccion de la que se debe extraer la lista.				*
		/*	Retorna: String que representa la url								*
		/************************************************************************/
		this.geturl_host= function (url){
			return url;			
		}


		//Metodos Privados

		function parsepeliculascocotipo1(url_servidor)
			{
			//http://www.peliculascoco.pro/index.php?do=cat&category=estrenos
			//http://www.peliculascoco.pro/index.php?do=cat&category=peliculas-online
			//http://www.peliculascoco.pro/index.php?do=cat&category=peliculas-vos
			//http://www.peliculascoco.pro/index.php?do=cat&category=hd
			url_servidor=unescape(url_servidor);
			var file_contents = get_urlsource(url_servidor);

			var array_aux = extraer_html_array(file_contents,'<div class="item-short-wrap">','</div>');
			file_contents = "";

			var titulo;
			var imagen;
			var url_video;	
			var page_uri = ':verenlaces:peliculascoco:';
			var array_playlist=[];

			for (var i=0;i<array_aux.length;i++)
				{
				titulo=extraer_texto(array_aux[i],'title="','"');
				imagen=extraer_texto(array_aux[i],'<img src="','"');
				url_video=extraer_texto(array_aux[i],'<a href="','"');

				array_playlist.push(new Item_menu(titulo,imagen,page_uri,url_video));	
			}

		return array_playlist;
		}
	}
	//Propiedades y metodos Estaticos
	PeliculasCoco.categoria= function() {return 'peliculas';}
	PeliculasCoco.getitem= function() {return new Item_menu('Peliculas Coco',"img/peliculascoco.png",':vercanales:peliculascoco');}

	CanalFactory.registrarCanal("PeliculasCoco",PeliculasCoco); //Registrar la clase PeliculasCoco

	/************************************************************************************
	/* var Pordede: Objeto que representa el canal  Pordede en Peliculas				*
	/************************************************************************************/
	var Pordede= function() {	
		var that=this; //Permite el acceso a metodos publicos desde metodos privados (closures): that.metodo_publico()
		//metodos publicos

		/************************************************************************
		/*	funcion getmenu: Devuelve un listado de las subsecciones del canal. *
		/*	Parametros: ninguno													*
		/*	Retorna: Array de objetos Item_menu									*
		/************************************************************************/
		this.getmenu= function(){
		//retorna el Menu
			var array_menu=[
				new Item_menu('Novedades','views/img/folder.png',':vercontenido:pordede:novedades:' + escape('http://www.pordede.com/pelis/index')),
				new Item_menu('Mas Vistas','views/img/folder.png',':vercontenido:pordede:masvistas:' + escape('http://www.pordede.com/pelis/index/showlist/viewed')),
				new Item_menu('Mas valoradas','views/img/folder.png',':vercontenido:pordede:masvaloradas:' + escape('http://www.pordede.com/pelis/index/showlist/valued')),
				new Item_menu('Buscar','views/img/search.png',':vercontenido:pordede:tipobusqueda:' + escape('http://www.pordede.com/search/'))
				];
		return array_menu;
		}

		/************************************************************************************
		/*	funcion getplaylist: Devuelve un listado del contenido de las subsecciones.     *
		/*	Parametros: 																    *
		/*		page: referencia a la pagina de showtime desde donde se llama a la funcion. * 																*
		/*		tipo: especifica los diferentes tipos de listas soportados por el canal.    *
		/*		url: direccion de la que se debe extraer la lista.							*
		/*	Retorna: Array de objetos Item_menu											    *
		/************************************************************************************/
		this.getplaylist= function (page, tipo, url) {
		var array_playlist=[];
			switch (tipo)
				{
				case "novedades":
					page.metadata.title = 'Pordede - Novedades';			
					array_playlist=this.parsepordedepeliculastipo1(url,'peliculas');
					break;
				case "masvistas":
					page.metadata.title = 'Pordede - Mas Vistas';			
					array_playlist=this.parsepordedepeliculastipo1(url,'peliculas');
					break;
				case "masvaloradas":
					page.metadata.title = 'Pordede - Mas Valoradas';			
					array_playlist=this.parsepordedepeliculastipo1(url,'peliculas');
					break;
				case "tipobusqueda":
					page.metadata.title = 'Pordede -Buscar';			
					array_playlist=this.parsepordedepeliculastipobusqueda(page, url, 'peliculas');
					break;		
				}	
		return array_playlist;
		}

		/****************************************************************************************
		/*	funcion getservidores: Devuelve un listado de enlaces a la pelicula en los 			*
		/*							servidores soportados. Sustituye a parseXXXXXpelicula (url)	*
		/*	Parametros: 																    	*
		/*		url: direccion de la que se debe extraer la lista.								*
		/*	Retorna: Array de servidores												    	*
		/****************************************************************************************/
		this.getservidores= function (url)
		{
			url=unescape(url);
			var file_contents = get_urlsource(url);

			var titulo;
			var imagen;
			var url_video;
			var servidor;
			var idioma;
			var calidad;
			var descripcion;

			file_contents = this.checkloginpordede(url, file_contents);
			if(file_contents!=false)
			{
				//item_Actual
				titulo = extraer_texto(file_contents, '<meta property="og:title" content="','"');
				imagen = extraer_texto(file_contents, '<meta property="og:image" content="','"');
				descripcion = extraer_texto(file_contents ,'<div class="info text" style="max-height: 140px;overflow:hidden">','</div>');
				descripcion = descripcion.replace(/^\s+|\s+$/g,'');

				this.item_Actual=new Item_menu(titulo,imagen,null,url,descripcion);


				var url_enlaces = 'http://www.pordede.com' + extraer_texto(file_contents, '<button class="defaultPopup big" href="','"');
				file_contents = get_urlsource(url_enlaces);
				var session = extraer_texto(file_contents, 'SESS = "','"');
				file_contents = extraer_texto(file_contents,'<ul class="linksList">','</ul>');
				var array_aux = extraer_html_array(file_contents,'<form method="POST" target="_blank" ','</form>');
				file_contents = "";

				var url_video;	
				var servidor;
				var idioma;
				var calidad;
				var array_servidores=[];

				for (var i=0;i<array_aux.length;i++)
				{
					url_video = extraer_texto(array_aux[i],'action="','"') + '&session=' + session;		
					servidor = extraer_texto(array_aux[i],'<img src="/images/hosts/popup_','.png');
					idioma = extraer_texto(array_aux[i],'<div class="flag ','"');
					calidad = extraer_texto(array_aux[i],'<div class="linkInfo quality"><i class="icon-facetime-video"></i>','</div>');
					calidad = calidad.replace(/^\s+|\s+$/g,'');

					var params={
						"url_host" : url_video,
						"servidor" : servidor,
						"idioma" : idioma,
						"calidad" : calidad
						};

					var objHost=HostFactory.createHost(servidor,params)
					if (objHost)
						{
							array_servidores.push(objHost);
						}				
				//Ordenar de mayor a menor calidad
				array_servidores.sort(function(x,y) { return x['calidad'] > y['calidad']});
				}
			}

		return array_servidores;
		}

		/************************************************************************
		/*	funcion gethost: Devuelve la url del host donde se aloja el video	*
		/*					 Sustituye a resolveXXXXXXpelicula(url)				*
		/*	Parametros:															*
		/*		url: direccion de la que se debe extraer la lista.				*
		/*	Retorna: String que representa la url								*
		/************************************************************************/
		this.geturl_host= function (url){
			var url_servidor = url.substr(0,url.indexOf('&session='));
			var session = url.substr(url.indexOf('&session=')+9);
			var url_header = 'error';

			var datos_post = {'_s': session};
			var file_contents = post_urlsource(url_servidor,datos_post);

			url = 'http://links.pordescargadirecta.com' + extraer_texto(file_contents,'<a class="episodeText" href="','"'); 
			file_contents = get_urlheaders(url);
			url_header = file_contents.multiheaders['Location'][0];

		return url_header;	
		}


		this.parsepordedepeliculastipo1 = function (url_servidor, tipo)
		{
			//http://www.pordede.com/pelis/index
			//http://www.pordede.com/pelis/index/showlist/viewed
			//http://www.pordede.com/pelis/index/showlist/valued
			url_servidor=unescape(url_servidor);
			var file_contents = get_urlsource(url_servidor);

			file_contents = this.checkloginpordede(url_servidor, file_contents);

			if(file_contents!=false)
			{		
				var array_aux = extraer_html_array(file_contents,'<a class="defaultLink extended"','</a>');
				file_contents = "";

				var titulo;
				var imagen;
				var url_video;	
				var page_uri;
				var array_playlist=[];
				var key;

				switch (tipo)
					{
					case "peliculas":
						key= 'http://www.pordede.com/peli/';
						page_uri = ':verenlaces:pordede:';
						break;
					case "series":
						key= 'http://www.pordede.com/serie/'; //tvshow¿?
						page_uri = ':vercontenido:pordedeseries:tiposerie:';
						break;
					}

				for (var i=0;i<array_aux.length;i++)
					{
					titulo=extraer_texto(array_aux[i],'title="','"');
					imagen='http://www.pordede.com' + extraer_texto(array_aux[i],'src="','"');
					url_video='http://www.pordede.com' + extraer_texto(array_aux[i],'href="','"');

					if(url_video.indexOf(key) == 0)
						{
						array_playlist.push(new Item_menu(titulo,imagen,page_uri,url_video));	
						}
					}	
			}
		return array_playlist;
		}

		this.parsepordedepeliculastipobusqueda = function (page, url_servidor, tipo)
		{
			//http://www.pordede.com/search/
			var array_playlist=[];
			var texto_busqueda=this.cuadroBuscar();
			if(texto_busqueda!= undefined)
			{
				url_servidor=unescape(url_servidor);
				page.metadata.title = "Pordede -Buscar - " + texto_busqueda;	
				url_servidor=escape(unescape(url_servidor) + texto_busqueda); 
				array_playlist=this.parsepordedepeliculastipo1(url_servidor,tipo);
			}

		return array_playlist;
		}				

		this.checkloginpordede = function (url_servidor, file_contents)
		{
			var logueado = file_contents.indexOf('LOGGEDIN = false;');
			var valor_retorno=false;
			if(logueado!=-1) //no logueado
				{
				var reason = 'Introduce tu usuario y contraseña de http://www.pordede.com';
				var do_query = false;
				while(1)
					{
					var credentials = plugin.getAuthCredentials("Pordede", reason, do_query, 'pordede');
					if(!credentials)
						{
						if(!do_query)
							{
							do_query = true;
							continue;
							}
						break;
						}
					if (credentials.rejected) {break;}
					if (credentials.username == "" || credentials.password == "")
						{
						if (!do_query)
							{
							do_query = true;
							continue;
							}
						break;
						}

					try
						{
						var sesionnumber = extraer_texto(file_contents,'SESS = "','"');

						var datos_post = {'LoginForm[username]:': credentials.username,'LoginForm[password]': credentials.password, 'popup': '1' , 'sesscheck': sesionnumber};
						file_contents = post_urlsource('http://www.pordede.com/site/login',datos_post);
						var logged = file_contents.indexOf('LOGGEDIN = true;');
						if(logged!=-1)
							{
							if(do_query == true) {showtime.notify('Logueado en Pordede como: ' + credentials.username, 3);}
							valor_retorno = get_urlsource(url_servidor);
							break;
							}
						else
							{
							reason = "Usuario/Contraseña Incorrecta.";
							continue;
							}
						}
						catch (ex) { e(ex); showtime.trace('Pordede: error al autenticarse.'); break; }
					}
				}
			else {valor_retorno = file_contents;} //logueado

		return valor_retorno;
		}


	}
	//Propiedades y metodos Estaticos
	Pordede.categoria= function() {return 'peliculas';}
	Pordede.getitem= function() {return new Item_menu('Pordede',"img/pordede.png",':vercanales:pordede');}

	CanalFactory.registrarCanal("Pordede",Pordede); //Registrar la clase Pordede

	/************************************************************************************
	/* var LiveStream: Objeto que representa el canal LiveStream en TV Online			*
	/************************************************************************************/
	var LiveStream= function() {	
		//var that=this; //Permite el acceso a metodos publicos desde metodos privados (closures): that.metodo_publico()

		var xml_list=[
			new Item_menu('GURB','img/xbmc_spot.jpg',':vercontenido:livestream:Lista de GURB:' + escape('http://pastebin.com/raw.php?i=F7YMkysY'), 'http://pastebin.com/raw.php?i=F7YMkysY'),
			new Item_menu('Live TV \nby Demon88','img/livetv.jpg',':vercontenido:livestream:Lista Live TV:' + escape('http://dennaka.googlecode.com/svn/trunk/LiveTV2.xml'), 'http://dennaka.googlecode.com/svn/trunk/LiveTV2.xml'),
			new Item_menu('Ivanetxml','img/xbmc_spot.jpg',':vercontenido:livestream:Lista de Ivanetxml:' + escape('http://pastebin.com/raw.phb?i=u8f4YwKg'), 'http://pastebin.com/raw.phb?i=u8f4YwKg'),
			new Item_menu('Dani Cajilla TV','img/xbmc_spot.jpg',':vercontenido:livestream:Lista de Dani Cajilla:' + escape('http://dl.dropboxusercontent.com/u/58407848/dani.xml'), 'http://dl.dropboxusercontent.com/u/58407848/dani.xml'),
			new Item_menu('Veremapc','img/plugins_xbmc.jpg',':vercontenido:livestream:Lista de Veremapc:' + escape('http://dl.dropboxusercontent.com/u/142085967/lista2.xml'), 'http://dl.dropboxusercontent.com/u/142085967/lista2.xml'),
			//new Item_menu('Barroso','img/plugins_xbmc.jpg',':vercontenido:livestream:Lista de Barroso:' + escape('http://dl.dropboxusercontent.com/u/135269751/lista de barroso.xml'), 'http://dl.dropboxusercontent.com/u/135269751/lista de barroso.xml'),
			new Item_menu('BlackList','http://sphotos-f.ak.fbcdn.net/hphotos-ak-xfa1/t1.0-9/223879_10150330678531663_3828387_n.jpg',':vercontenido:livestream:La lista Negra:' + escape('http://dl.dropbox.com/s/ug80e43ykfussn3/The Black List.xml'), 'http://dl.dropbox.com/s/ug80e43ykfussn3/The Black List.xml'),
			//new Item_menu('Staael','img/plugins_xbmc.jpg',':vercontenido:livestream:Lista de Staael:' + escape('https://github.com/mash2k3/Staael1982/raw/master/LIVE TV/SPORT.xml'), 'https://github.com/mash2k3/Staael1982/raw/master/LIVE TV/SPORT.xml'),
			//new Item_menu('Plugins XBMC','img/plugins_xbmc.jpg',':vercontenido:livestream:Lista de Plugins XBMC:' + escape('http://dl.dropboxusercontent.com/u/241193960/pluginsxbmc.xml'), 'http://dl.dropboxusercontent.com/u/241193960/pluginsxbmc.xml'),
			new Item_menu('PiKoMuLe','img/pikomule.png',':vercontenido:livestream:Lista de PiKoMuLe:' + escape('http://dl.dropboxusercontent.com/s/al4x26cyp947kc1/PiKoMuLe.xml'), 'http://dl.dropboxusercontent.com/s/al4x26cyp947kc1/PiKoMuLe.xml')	
			];

		//Añadir lista service.urlxml_liveStream si existe
			if ((service.urlxml_liveStream.startsWith('http') && service.urlxml_liveStream.endsWith('.xml')) || service.urlxml_liveStream.startsWith('http://pastebin.com'))
				{
				xml_list.push(new Item_menu('Personal','views/img/folder.png',':vercontenido:livestream:lista:' + escape(service.urlxml_liveStream),service.urlxml_liveStream)); 
				}	

		//metodos publicos

		/************************************************************************
		/*	funcion getmenu: Devuelve un listado de las subsecciones del canal. *
		/*	Parametros: ninguno													*
		/*	Retorna: Array de objetos Item_menu									*
		/************************************************************************/
		this.getmenu= function(){

			var array_menu=[];

			for (var i=0;i<xml_list.length;i++){
				var objItem=xml_list[i];
				//Obtener fecha de actualizacion y comprobar que la lista existe
				var fecha=getDate(objItem.url);
				
				if (fecha != 'error')
				{
					if (fecha !='') objItem.titulo=objItem.titulo + ' \n(' + fecha + ')';	
					array_menu.push(objItem)
				}
				
			}

			array_menu.push(new Item_menu('Todo','views/img/folder.png',':vercontenido:livestream:todos:default')); 

		return array_menu;
		}

		/************************************************************************************
		/*	funcion getplaylist: Devuelve un listado del contenido de las subsecciones.     *
		/*	Parametros: 																    *
		/*		page: referencia a la pagina de showtime desde donde se llama a la funcion. * 																*
		/*		tipo: especifica los diferentes tipos de listas soportados por el canal.    *
		/*		url: direccion de la que se debe extraer la lista.							*
		/*	Retorna: Array de objetos Item_menu											    *
		/************************************************************************************/
		this.getplaylist= function (page, tipo, url) {
			var array_playlist=[];

			switch (tipo)
			{					
				case "todos":
					page.metadata.title ='Todas las listas';
					for (var i=0;i<xml_list.length;i++)
					{
						array_playlist=array_playlist.concat(parselivestreamxmltipo1(xml_list[i].url));
					}
					array_playlist=array_playlist.uniqueObjects(['url']); //Eliminar duplicados
					break;
				default:
					page.metadata.title =tipo; //En este caso el tipo es tb el titulo de la page
					array_playlist=parselivestreamxmltipo1(url);
					break;
			}


			return array_playlist.sortBy('titulo');
		}

		/****************************************************************************************
		/*	funcion getservidores: Devuelve un listado de enlaces a la pelicula en los 			*
		/*							servidores soportados. Sustituye a parseXXXXXpelicula (url)	*
		/*	Parametros: 																    	*
		/*		url: direccion de la que se debe extraer la lista.								*
		/*	Retorna: Array de servidores												    	*
		/****************************************************************************************/
		this.getservidores= function (url)
		{
		//En este caso esta funcion no es necesaria
		//La mantenemos por coherencia pero retornamos una Array vacio
		var array_servidores=[];
		return array_servidores;
		}

		/************************************************************************
		/*	funcion gethost: Devuelve la url del host donde se aloja el video	*
		/*					 Sustituye a resolveXXXXXXpelicula(url)				*
		/*	Parametros:															*
		/*		url: direccion de la que se debe extraer la lista.				*
		/*	Retorna: String que representa la url								*
		/************************************************************************/
		this.geturl_host= function (url){
			//En este caso esta funcion no es necesaria
			//La mantenemos por coherencia
			return url;		
		}


		//Metodos Privados	
		function parselivestreamxmltipo1(url_xml)
		{
			url_xml=unescape(url_xml);
			var file_contents = get_urlsource(url_xml);

			//Recuperamos todos los <item> en forma de array
			var array_aux = extraer_html_array(file_contents,'<item>', '</item>');
			file_contents = "";

			var titulo;
			var imagen;
			var imagen_default = plugin.path + "img/tvonline.png";
			var url_video;	
			var page_uri;
			var array_playlist=[];
			for (var i=0;i<array_aux.length;i++)
			{
				url_video = extraer_texto(array_aux[i], '<link>', '</link>');
				//Añado el canal al listado si creo que la url_video es valida ...
				// rtmp...; http....m3u8; http...mp4?xxxx
				if ((url_video.startsWith("rtmp")) || (url_video.search(/^(http(:|s:)).+\.mp4\?.+/i)!=-1) || (url_video.search(/^(http(:|s:)).+\.m3u8$/i)!=-1))
				{
					titulo = extraer_texto(array_aux[i], '<title>', '</title>').trim()
					//Eliminar posibles tags de formato del tipo [COLOR red] ...[/COLOR]
					titulo=titulo.replace(/\[\/?\w*\s*\w*/g,'');
					titulo=titulo.replace(/\]/g,'');

					if (titulo.length !=0 && titulo.substring(0,5).search(/off/i) == -1 && titulo.substring(-5).search(/off/i) == -1)
					{
						// ... y el titulo no comienza, ni termina por OFF
						titulo=titulo.toProperCase();
						imagen = extraer_texto(array_aux[i], '<thumbnail>', '</thumbnail>');

						if (imagen == "") {imagen = imagen_default};

						page_uri = ':vervideo:livestream:StreamsRtmp:' + escape(titulo) + ':' + escape(imagen) + ':' ;						
						array_playlist.push(new Item_menu(titulo,imagen,page_uri,url_video));	
					}
				}
			}			
			if (array_playlist.length==0) array_playlist= parselivestreamxmltipodir (url_xml); //Comprobamos si es una recopilacion de Listas Xml
		return array_playlist;
		}

		function parselivestreamxmltipodir (url_xml)
		{
			var array_playlist=[];
			var file_contents = get_urlsource(unescape(url_xml));

			//Recuperamos todos los <dir> en forma de array
			var array_aux = extraer_html_array(file_contents,'<dir>', '</dir>');
			file_contents = "";

			for (var i=0;i<array_aux.length;i++)
			{
				array_playlist=array_playlist.concat(parselivestreamxmltipo1(extraer_texto(array_aux[i], '<link>', '</link>')))
			}
		return array_playlist;
		}

		function getDate(url_xml)
		{
			try {
				url_xml=unescape(url_xml);
				var aux;

				var file_contents = get_urlsource(url_xml).toLowerCase();
				var texto= extraer_texto(file_contents,'actualiza','</');
				aux=texto.match(/\d{1,2}(\/|-)\d{1,2}(\/|-)\d{2,4}/);

			return aux?aux[0]:'';
			}
			catch (err) {
				//if (err == "Error: HTTP error: 404")
				return 'error';
			}

		}


	}
	//Propiedades y metodos Estaticos
	LiveStream.categoria= function() {return 'tvonline';}
	LiveStream.getitem= function() {return new Item_menu('LiveStream',"img/livestreams.png",':vercanales:livestream');}

	CanalFactory.registrarCanal("LiveStream",LiveStream); //Registrar la clase LiveStream

	/************************************************************************************
	/* var SpliveTV: Objeto que representa el canal SpliveTV en TV Online				*
	/************************************************************************************/
	var SpliveTV= function() {	
		//var that=this; //Permite el acceso a metodos publicos desde metodos privados (closures): that.metodo_publico()

		//metodos publicos

		/************************************************************************
		/*	funcion getmenu: Devuelve un listado de las subsecciones del canal. *
		/*	Parametros: ninguno													*
		/*	Retorna: Array de objetos Item_menu									*
		/************************************************************************/
		this.getmenu= function(){
		//retorna el Menu
			var array_menu=[
				new Item_menu('Deportes','img/splivetv_deportes.png',':vercontenido:splivetv:Deportes:'+ escape('http://spliveapp.com/listas/Deportes.xml')),
				//new Item_menu('InterDeportes','img/splivetv_interdeportes.png',':vercontenido:splivetv:InterDeportes:'+ escape('http://spliveapp.com/listas/InterDeportes_Splive.xml')),
				new Item_menu('Cine','img/splivetv_cine.png',':vercontenido:splivetv:Cine:'+ escape('http://spliveapp.com/listas/Cine.xml')),
				new Item_menu('Series','img/splivetv_series.png',':vercontenido:splivetv:Series:'+ escape('http://spliveapp.com/listas/Series.xml')),
				new Item_menu('Infantil','img/splivetv_infantiles.png',':vercontenido:splivetv:Infantil:'+ escape('http://spliveapp.com/listas/Infantil.xml')),
				new Item_menu('Documentales','img/splivetv_documentales.png',':vercontenido:splivetv:Documentales:'+ escape('http://spliveapp.com/listas/Documentales.xml')),
				new Item_menu('Mediaset','img/splivetv_mediaset.png',':vercontenido:splivetv:Mediaset:'+ escape('http://spliveapp.com/listas/Mediaset.xml')),			
				];
		return array_menu;
		}

		/************************************************************************************
		/*	funcion getplaylist: Devuelve un listado del contenido de las subsecciones.     *
		/*	Parametros: 																    *
		/*		page: referencia a la pagina de showtime desde donde se llama a la funcion. * 																*
		/*		tipo: especifica los diferentes tipos de listas soportados por el canal.    *
		/*		url: direccion de la que se debe extraer la lista.							*
		/*	Retorna: Array de objetos Item_menu											    *
		/************************************************************************************/
		this.getplaylist= function (page, tipo, url) {
			var array_playlist=[];

			page.metadata.title =tipo; //En este caso el tipo es el titulo de la page

			array_playlist=parsesplivetvxmltipo1(url);

		return array_playlist.sortBy('titulo');
		}

		/****************************************************************************************
		/*	funcion getservidores: Devuelve un listado de enlaces a la pelicula en los 			*
		/*							servidores soportados. Sustituye a parseXXXXXpelicula (url)	*
		/*	Parametros: 																    	*
		/*		url: direccion de la que se debe extraer la lista.								*
		/*	Retorna: Array de servidores												    	*
		/****************************************************************************************/
		this.getservidores= function (url){
			//En este caso esta funcion no es necesaria
			//La mantenemos por coherencia pero retornamos una Array vacio
			var array_servidores=[];
			return array_servidores;
		}

		/************************************************************************
		/*	funcion gethost: Devuelve la url del host donde se aloja el video	*
		/*					 Sustituye a resolveXXXXXXpelicula(url)				*
		/*	Parametros:															*
		/*		url: direccion de la que se debe extraer la lista.				*
		/*	Retorna: String que representa la url								*
		/************************************************************************/
		this.geturl_host= function (url){
			//En este caso esta funcion no es necesaria
			//La mantenemos por coherencia
			return url;		
		}


		//Metodos Privados
		function parsesplivetvxmltipo1(url_xml){
			url_xml=unescape(url_xml);

			var titulo;
			var imagen;
			var imagen_default =  "img/tvonline.png";
			var url_video;	
			var page_uri;
			var array_playlist=[];

			var file_contents = get_urlsource(url_xml);

			//Recuperamos todos los <channel> en forma de array
			var array_aux = extraer_html_array(file_contents,'<channel>', '</channel>');
			file_contents = "";

			for (var i=0;i<array_aux.length;i++)
			{

				url_video = extraer_texto(array_aux[i], '<rtmp>', '</rtmp>');
				//Añado el canal al listado si esta disponible y el protocolo es rtmp
				if (extraer_texto(array_aux[i], '<available>', '</available>') == 1 && url_video.startsWith("rtmp"))
				{
					titulo = extraer_texto(array_aux[i], '<name>', '</name>').trim()
					imagen = extraer_texto(array_aux[i], '<link_logo>', '</link_logo>');
					page_uri = ':vervideo:SpliveTV:StreamsRtmp:' + escape(titulo) + ':' + escape(imagen) + ':' ;

					array_playlist.push(new Item_menu(titulo,imagen,page_uri,url_video));
				}
			}

		return array_playlist;
		}

	}
	//Propiedades y metodos Estaticos
	SpliveTV.categoria= function() {return 'tvonline';}
	SpliveTV.getitem= function() {return new Item_menu('SpliveTV',"img/splivetv.png",':vercanales:splivetv');}

	CanalFactory.registrarCanal("splivetv",SpliveTV); //Registrar la clase SpliveTV

	/************************************************************************************
	/* var SeriesPepito: Objeto que representa el canal Series Pepito en Series			*
	/************************************************************************************/
	var SeriesPepito= function() {	
		var that=this; //Permite el acceso a metodos publicos desde metodos privados (closures): that.metodo_publico()
		//metodos publicos

		/************************************************************************
		/*	funcion getmenu: Devuelve un listado de las subsecciones del canal. *
		/*	Parametros: ninguno													*
		/*	Retorna: Array de objetos Item_menu									*
		/************************************************************************/
		this.getmenu= function(){
		//retorna el Menu
			var array_menu=[
				new Item_menu('Ultimos capitulos','views/img/folder.png',':vercontenido:seriespepito:tipoultimoscapitulos:' + escape('http://www.seriespepito.com/nuevos-capitulos')),
				new Item_menu('Ultimos estrenos','views/img/folder.png',':vercontenido:seriespepito:tipoultimoscapitulosestreno:' + escape('http://www.seriespepito.com')),
				//new Item_menu('Lista de series','views/img/folder.png',':alfabeto:peliculaspepito'),
				new Item_menu('Lista de series','views/img/folder.png',':alfabeto:peliculaspepito:num'),
				new Item_menu('Buscar','views/img/search.png',':vercontenido:seriespepito:tipobusqueda:' + escape('http://www.seriespepito.com/buscador'))
				];
		return array_menu;
		}

		/************************************************************************************
		/*	funcion getplaylist: Devuelve un listado del contenido de las subsecciones.     *
		/*	Parametros: 																    *
		/*		page: referencia a la pagina de showtime desde donde se llama a la funcion. * 																*
		/*		tipo: especifica los diferentes tipos de listas soportados por el canal.    *
		/*		url: direccion de la que se debe extraer la lista.							*
		/*	Retorna: Array de objetos Item_menu											    *
		/************************************************************************************/
		this.getplaylist= function (page, tipo, url) {
			var array_playlist=[];
			switch (tipo)
			{
				case "tipoultimoscapitulos":
					array_playlist=parseseriespepitotipoultimoscapitulos(url, page);
					break;
				case "tipoultimoscapitulosestreno":
					array_playlist=parseseriespepitotipoultimoscapitulosestreno(url, page);
					break;
				case "tipolistado":
					array_playlist=parseseriespepitotipolistado(url, page);
					break;
				case "tipobusqueda":
					array_playlist=parseseriespepitotipobusqueda(url, page);
					break;
				case "tiposerie":
					array_playlist=parseseriespepitoserie(url, page);
					break;
			}
		return array_playlist;
		}

		/****************************************************************************************
		/*	funcion getservidores: Devuelve un listado de enlaces a la pelicula en los 			*
		/*							servidores soportados. Sustituye a parseXXXXXcapitulo (url)	*
		/*	Parametros: 																    	*
		/*		url: direccion de la que se debe extraer la lista.								*
		/*	Retorna: Array de servidores												    	*
		/****************************************************************************************/
		this.getservidores= function (url)
		{
			url=unescape(url);

			var file_contents = get_urlsource(url);

			var titulo;
			var imagen;
			var url_video;
			var servidor;
			var idioma;
			var calidad;
			var descripcion;

			//item_Actual
			titulo = extraer_texto(file_contents ,'<div class="dtitulo">','</div>');
			titulo = extraer_texto(titulo ,'<h2>','</h2>');
			imagen = extraer_texto(file_contents ,'<img class="img-polaroid imgcolserie"','</center>');
			imagen = extraer_texto(imagen ,'src="','"');
			descripcion = '';

			this.item_Actual=new Item_menu(titulo,imagen,null,url,descripcion);

			var aux_string = extraer_texto(file_contents, '</thead>','</table>');
			file_contents = "";

			var array_aux = extraer_html_array(aux_string,'<tr>','</tr>');

			var array_servidores=[];

			for (var i=0;i<array_aux.length;i++)
				{
				url_video=extraer_texto(array_aux[i],'href="','"');
				servidor = extraer_texto(array_aux[i],'alt="','"');
				idioma = extraer_texto(array_aux[i],'<span class="flag ','"');
				switch (idioma)
				{
					case "flag_0":
						idioma='Español';
						break;
					case "flag_1":
						idioma='Latino';
						break;
					case "flag_2":
						idioma='Ingles';
						break;
					case "flag_3":
						idioma='Ingles Subtitulado';
				}
				var params={
						"url_host" : url_video,
						"servidor" : servidor,
						"idioma" : idioma,
						"calidad" : calidad
						};

				var objHost=HostFactory.createHost(servidor,params)
				if (objHost)
					{
						array_servidores.push(objHost);
					}				
				}	
		return array_servidores;
		}

		/************************************************************************
		/*	funcion gethost: Devuelve la url del host donde se aloja el video	*
		/*					 Sustituye a resolveXXXXXXpelicula(url)				*
		/*	Parametros:															*
		/*		url: direccion de la que se debe extraer la lista.				*
		/*	Retorna: String que representa la url								*
		/************************************************************************/
		this.geturl_host= function (url){ 
			return extraer_texto(get_urlsource(url),'title="Ver..." href="','">');	
		}

		/************************************************************************************
		/*	funcion getitem_alfabeto: Devuelve un listado de las subsecciones del canal. 	*
		/*	Parametros: ninguno																*
		/*	Retorna:Un objetos Item_menu													*
		/***********************************************************************************/
		this.getitem_alfabeto= function() {
			return (new Item_menu("Series Pepito - Orden Alfabetico","views/img/folder.png",':vercontenido:seriespepito:tipolistado:','http://www.seriespepito.com/lista-series-'))
		}

		//Metodos Privados

		function parseseriespepitotipoultimoscapitulos(url_servidor, page)
			{
			//http://www.seriespepito.com/nuevos-capitulos/
			url_servidor=unescape(url_servidor);
			page.metadata.title = 'Series Pepito - Ultimos Capitulos';

			var file_contents = get_urlsource(url_servidor);

			var aux_string = extraer_texto(file_contents, 'lista_series', '</ul>');
			var array_aux = extraer_html_array(aux_string,'<li>','</li>');

			var titulo;
			var imagen;
			var url_video;	
			var page_uri = ':verenlaces:seriespepito:';
			var array_playlist=[];

			for (var i=0;i<array_aux.length;i++)
				{
				titulo=extraer_texto(array_aux[i],'&nbsp;<a title="','"');
				imagen=extraer_texto(array_aux[i],'src="','"');
				url_video=extraer_texto(array_aux[i],'&nbsp;<a title="','>');
				url_video=extraer_texto(url_video,'href="','"');

				array_playlist.push(new Item_menu(titulo,imagen,page_uri,url_video));
				}

		return array_playlist;
		}

		function parseseriespepitotipoultimoscapitulosestreno(url_servidor, page)
			{
			url_servidor=unescape(url_servidor);
			page.metadata.title = 'Series Pepito - Ultimos Estrenos';

			var file_contents = get_urlsource(url_servidor);

			var aux_string = extraer_texto(file_contents, 'tulos de estreno', '<div');
			var array_aux = extraer_html_array(aux_string,'<li>','</li>');

			var titulo;
			var imagen =  "views/img/folder.png";
			var url_video;   
			var page_uri = ':verenlaces:seriespepito:';
			var array_playlist=[];

			for (var i=0;i<array_aux.length;i++)
				{
				titulo=extraer_texto(array_aux[i],'title="','"');
				url_video=extraer_texto(array_aux[i],'href="','"');

				array_playlist.push(new Item_menu(titulo,imagen,page_uri,url_video));
				}
      
		return array_playlist;
		}


		function parseseriespepitotipolistado(url_servidor, page)
			{
			//http://www.seriespepito.com/ (listado
			url_servidor=unescape(url_servidor);

			page.metadata.title = 'Series Pepito - Listado Series';

			var file_contents = get_urlsource(url_servidor);

			var aux_string = extraer_texto(file_contents, '<ul class="lista_series">', '</ul>');
			var array_aux = extraer_html_array(aux_string,'<li>','</li>');

			var titulo;
			var imagen //= plugin.path + "views/img/folder.png";
			var url_video;	
			var page_uri = ':vercontenido:seriespepito:tiposerie:';

			var array_playlist=[];

			for (var i=0;i<array_aux.length;i++)
				{
				titulo=extraer_texto(array_aux[i],'title="','"');
				imagen=extraer_texto(array_aux[i],'src="','"');
				url_video=extraer_texto(array_aux[i],'href="','"');

				array_playlist.push(new Item_menu(titulo,imagen,page_uri,url_video));
				}

		return array_playlist;
		}

		function parseseriespepitotipobusqueda(url_servidor, page)
			{
			//buscar
			url_servidor=unescape(url_servidor);
			var array_playlist=[];

			var texto_busqueda=that.cuadroBuscar();
			if ( texto_busqueda != undefined) 
				{
					texto_busqueda = texto_busqueda.replace(/ /g,'-');

					page.metadata.title = 'Series Pepito - Buscar ' + texto_busqueda;

					var file_contents = get_urlsource(url_servidor + '/' + texto_busqueda + '/');

					var resultados = file_contents.indexOf('o hemos encontrado');
					if(resultados==-1)
					{
						var aux_string = extraer_texto(file_contents, 'lista_series', '</ul>');
						var array_aux = extraer_html_array(aux_string,'<li>','</li>');

						var titulo;
						var imagen;
						var url_video;	
						var page_uri = ':vercontenido:seriespepito:tiposerie:';

						var array_playlist=[];

						for (var i=0;i<array_aux.length;i++)
							{
							titulo=extraer_texto(array_aux[i],'title="','"');
							imagen=extraer_texto(array_aux[i],'src="','"');
							url_video=extraer_texto(array_aux[i],'href="','"');

							array_playlist.push(new Item_menu(titulo,imagen,page_uri,url_video));
							}
					}
				}

		return array_playlist;
		}

		function parseseriespepitoserie(url_serie, page)
			{
			url_serie=unescape(url_serie);

			var file_contents = get_urlsource(url_serie);

			var titulo;
			titulo = extraer_texto(file_contents,'<div class="dtitulo">','</div>');
			titulo = extraer_texto(titulo,'<h1>','</h1>');
			page.metadata.title = titulo;
			var imagen;
			//var descripcion;
			var url_video;	
			var page_uri = ':verenlaces:seriespepito:';
			imagen = extraer_texto(file_contents ,'<img class="img-polaroid imgcolserie"','</center>');
			imagen = extraer_texto(imagen ,'src="','"');		
			//descripcion = extraer_texto(file_contents ,'<div id="description"> <p> ',' ... <a');
			//imagen=plugin.path + "views/img/folder.png";

			file_contents = extraer_texto(file_contents,'<div class="accordion"','</div></div></div></div>');
			var array_aux = extraer_html_array(file_contents,'<tr><td>','</td></tr>');
			file_contents = "";
			var array_playlist=[];

			for (var i=0;i<array_aux.length;i++)
				{
				titulo=extraer_texto(array_aux[i],'<strong> ','</a>');
				//titulo=titulo.replace('</strong> ','');
				//imagen=extraer_texto(array_aux[i],'src="','"');
				url_video=extraer_texto(array_aux[i],'href="','"');

				array_playlist.push(new Item_menu(titulo,imagen,page_uri,url_video));
				}

		return array_playlist;
		}

	}
    //Propiedades y metodos Estaticos
	SeriesPepito.categoria= function() {return 'series';}
	SeriesPepito.getitem= function() {return new Item_menu('Series Pepito',"img/seriespepito.png",':vercanales:seriespepito');}

	//CanalFactory.registrarCanal("SeriesPepito",SeriesPepito); //Registrar la clase SeriesPepito

	/************************************************************************************
	/* var Vodlyseries: Objeto que representa el canal Vodly en Series. Hereda de Vodly	*
	/************************************************************************************/
	var Vodlyseries= function() {	
		//var that=this; //Permite el acceso a metodos publicos desde metodos privados (closures): that.metodo_publico()
		//metodos publicos

		/************************************************************************
		/*	funcion getmenu: Devuelve un listado de las subsecciones del canal. *
		/*	Parametros: ninguno													*
		/*	Retorna: Array de objetos Item_menu									*
		/************************************************************************/
		this.getmenu= function(){
		//retorna el Menu
			var array_menu=[
				new Item_menu('Latest Prime-Time Episodes','views/img/folder.png',':vercontenido:vodlyseries:tipolatest:' + escape('http://www.vodly.to/?tv')),
				new Item_menu('Just Added','views/img/folder.png',':vercontenido:vodlyseries:tipojustadd:' + escape('http://www.vodly.to/?tv')),
				new Item_menu('Featured','views/img/folder.png',':vercontenido:vodlyseries:tipofeatured:' + escape('http://www.vodly.to/?tv&sort=featured')),
				new Item_menu('Popular','views/img/folder.png',':vercontenido:vodlyseries:tipopopular:' + escape('http://www.vodly.to/?tv&sort=views')),
				new Item_menu('Buscar','views/img/search.png',':vercontenido:vodlyseries:tipobusqueda:' + escape('http://www.vodly.to/index.php?search_keywords='))
				];
		return array_menu;
		}

		/************************************************************************************
		/*	funcion getplaylist: Devuelve un listado del contenido de las subsecciones.     *
		/*	Parametros: 																    *
		/*		page: referencia a la pagina de showtime desde donde se llama a la funcion. * 																*
		/*		tipo: especifica los diferentes tipos de listas soportados por el canal.    *
		/*		url: direccion de la que se debe extraer la lista.							*
		/*	Retorna: Array de objetos Item_menu											    *
		/************************************************************************************/
		this.getplaylist= function (page, tipo, url) {
			var array_playlist=[];
			switch (tipo)
			{
				case "tipolatest":
					page.metadata.title = "Vodly - Latest Prime-Time Episodes";
					array_playlist=parsevodlyseriestipolatest(url);
					break;
				case "tipojustadd":
					page.metadata.title = "Vodly - Just Added";
					array_playlist=this.parsevodly(url,'series');
					break;
				case "tipofeatured":
					page.metadata.title = "Vodly - Featured";
					array_playlist=this.parsevodly(url,'series');
					break;
				case "tipopopular":
					page.metadata.title = "Vodly - Popular Movies";
					array_playlist=this.parsevodly(url,'series');
					break;
				case "tipobusqueda":
					//http://www.vodly.to/index.php?search_keywords=robocop&search_section=1
					array_playlist=this.parsevodlytipobusqueda(page, url,'series');
					break;
				case "tiposerie":
					array_playlist=parsevodlyseriestiposerie(url, page);
					break;					
			}
		return array_playlist;
		}

		/************************************************************************
		/*	funcion gethost: Devuelve la url del host donde se aloja el video	*
		/*					 Sustituye a resolveXXXXXXpelicula(url)				*
		/*	Parametros:															*
		/*		url: direccion de la que se debe extraer la lista.				*
		/*	Retorna: String que representa la url								*
		/************************************************************************/
		this.geturl_host= function (url){
			return get_urlheaders(url).headers['Location'];		
		}


		//Metodos Privados		
		function parsevodlyseriestipolatest(url_servidor)
			{
			//http://www.vodly.to/?tv
			url_servidor=unescape(url_servidor);
			var file_contents = get_urlsource(url_servidor);
			var aux_string = extraer_texto(file_contents,'<div id="slide-runner">','</div>');
			var array_aux = extraer_html_array(aux_string,'<a','</a>');            
			file_contents = "";
      
			var titulo;
			var imagen;
			var url_video;   
			var page_uri = ':verenlaces:vodlyseries:';
			var array_playlist=[];
      
			for (var i=0;i<array_aux.length;i++)
				{
				titulo=extraer_texto(array_aux[i],'title="','"');
				imagen=extraer_texto(array_aux[i],'src="','"');
				url_video=extraer_texto(array_aux[i],'href="','"');
				//filtrar si es serie o pelicula
				//si es serie empieza por tv- si es peli por watch-
				if(url_video.indexOf('http://vodly.to/tv-')==0)
					{
						array_playlist.push(new Item_menu(titulo,imagen,page_uri,url_video));	
					}

			}
		return array_playlist;
		}
      
		function parsevodlyseriestiposerie(url_servidor, page)
			{
			//http://vodly.to/tv-****
			url_servidor=unescape(url_servidor);
			var file_contents = get_urlsource(url_servidor);
			var array_aux = extraer_html_array(file_contents,'<div class="tv_episode_item">','</div>');

			var titulo = extraer_texto(file_contents,'<meta property="og:title" content="','"');
			page.metadata.title = titulo;
			var imagen = extraer_texto(file_contents ,'<div class="movie_thumb"><img itemprop="image" src="','"');
			//var descripcion;
			var url_video;	
			var page_uri = ':verenlaces:vodly:';
			var array_playlist=[];
			file_contents = "";

			for (var i=0;i<array_aux.length;i++)
				{
				titulo=extraer_texto(array_aux[i],'title="','"');
				url_video=extraer_texto(array_aux[i],'<a href="','"');

				array_playlist.push(new Item_menu(titulo,imagen,page_uri,url_video));
			}
      return array_playlist;
      }
	}
	//Propiedades y metodos Estaticos
	Vodlyseries.padre='Vodly';
	Vodlyseries.categoria= function() {return 'series';}
	Vodlyseries.getitem= function() {return new Item_menu('Vodly',"img/vodly.png",':vercanales:vodlyseries');}

	CanalFactory.registrarCanal("Vodlyseries",Vodlyseries); //Registrar la clase Vodlyseries

	/************************************************************************************
	/* var Pordede: Objeto que representa el canal  Pordede en Series				*
	/************************************************************************************/
	var Pordedeseries= function() {	
		var that=this; //Permite el acceso a metodos publicos desde metodos privados (closures): that.metodo_publico()
		//metodos publicos

		/************************************************************************
		/*	funcion getmenu: Devuelve un listado de las subsecciones del canal. *
		/*	Parametros: ninguno													*
		/*	Retorna: Array de objetos Item_menu									*
		/************************************************************************/
		this.getmenu= function(){
		//retorna el Menu
			var array_menu=[
				new Item_menu('Novedades','views/img/folder.png',':vercontenido:pordedeseries:novedades:' + escape('http://www.pordede.com/series/index')),
				new Item_menu('Mas Vistas','views/img/folder.png',':vercontenido:pordedeseries:masvistas:' + escape('http://www.pordede.com/series/index/showlist/viewed')),
				new Item_menu('Mas valoradas','views/img/folder.png',':vercontenido:pordedeseries:masvaloradas:' + escape('http://www.pordede.com/series/index/showlist/valued')),
				new Item_menu('Buscar','views/img/search.png',':vercontenido:pordedeseries:tipobusqueda:' + escape('http://www.pordede.com/search/'))
				];
		return array_menu;
		}


		/************************************************************************************
		/*	funcion getplaylist: Devuelve un listado del contenido de las subsecciones.     *
		/*	Parametros: 																    *
		/*		page: referencia a la pagina de showtime desde donde se llama a la funcion. * 																*
		/*		tipo: especifica los diferentes tipos de listas soportados por el canal.    *
		/*		url: direccion de la que se debe extraer la lista.							*
		/*	Retorna: Array de objetos Item_menu											    *
		/************************************************************************************/
		this.getplaylist= function (page, tipo, url) {
		var array_playlist=[];
			switch (tipo)
				{
				case "novedades":
					page.metadata.title = 'Pordede - Novedades';			
					array_playlist=this.parsepordedepeliculastipo1(url,'series');
					break;
				case "masvistas":
					page.metadata.title = 'Pordede - Mas Vistas';			
					array_playlist=this.parsepordedepeliculastipo1(url,'series');
					break;
				case "masvaloradas":
					page.metadata.title = 'Pordede - Mas Valoradas';			
					array_playlist=this.parsepordedepeliculastipo1(url,'series');
					break;
				case "tipobusqueda":
					page.metadata.title = 'Pordede -Buscar';			
					array_playlist=this.parsepordedepeliculastipobusqueda(page, url, 'series');
					break;
				case "tiposerie":
					array_playlist=parsepordedeserie(page,url);
					break;
				}	
		return array_playlist;
		}		


		/****************************************************************************************
		/*	funcion getservidores: Devuelve un listado de enlaces a la pelicula en los 			*
		/*							servidores soportados. Sustituye a parseXXXXXpelicula (url)	*
		/*	Parametros: 																    	*
		/*		url: direccion de la que se debe extraer la lista.								*
		/*	Retorna: Array de servidores												    	*
		/****************************************************************************************/
		this.getservidores= function (url){
			url=unescape(url);
			var file_contents = get_urlsource(url);

			var titulo;
			var imagen;
			var url_video;
			var servidor;
			var idioma;
			var calidad;
			var descripcion;

			file_contents = this.checkloginpordede(url, file_contents);
			if(file_contents!=false)
			{
				//item_Actual
				titulo = extraer_texto(file_contents, '<meta property="og:title" content="','"');
				imagen = extraer_texto(file_contents, '<meta property="og:image" content="','"');
				imagen = "views/img/folder.png";
				descripcion = '';

				this.item_Actual=new Item_menu(titulo,imagen,null,url,descripcion);

				//var url_enlaces = 'http://www.pordede.com' + extraer_texto(file_contents, '<span class="title defaultPopup" href="','"');
				//showtime.trace('Debug   :'  + url_enlaces);
				//file_contents = get_urlsource(url_enlaces);

				var session = extraer_texto(file_contents, 'SESS = "','"');
				file_contents = extraer_texto(file_contents,'<ul class="linksList">','</ul>');
				var array_aux = extraer_html_array(file_contents,'<form method="POST" target="_blank" ','</form>');
				file_contents = "";

				var url_video;	
				var servidor;
				var idioma;
				var calidad;
				var array_servidores=[];

				for (var i=0;i<array_aux.length;i++)
				{
					url_video = extraer_texto(array_aux[i],'action="','"') + '&session=' + session;		
					servidor = extraer_texto(array_aux[i],'<img src="/images/hosts/popup_','.png');
					idioma = extraer_texto(array_aux[i],'<div class="flag ','"');
					calidad = extraer_texto(array_aux[i],'<div class="linkInfo quality"><i class="icon-facetime-video"></i>','</div>');
					calidad = calidad.replace(/^\s+|\s+$/g,'');

					var params={
						"url_host" : url_video,
						"servidor" : servidor,
						"idioma" : idioma,
						"calidad" : calidad
						};

					var objHost=HostFactory.createHost(servidor,params)
					if (objHost)
						{
							array_servidores.push(objHost);
						}				
				//Ordenar de mayor a menor calidad
				array_servidores.sort(function(x,y) { return x['calidad'] > y['calidad']});
				}
			}

		return array_servidores;
		}

		/************************************************************************
		/*	funcion gethost: Devuelve la url del host donde se aloja el video	*
		/*					 Sustituye a resolveXXXXXXpelicula(url)				*
		/*	Parametros:															*
		/*		url: direccion de la que se debe extraer la lista.				*
		/*	Retorna: String que representa la url								*
		/************************************************************************/
		this.geturl_host= function (url){
			var url_servidor = url.substr(0,url.indexOf('&session='));
			var session = url.substr(url.indexOf('&session=')+9);
			var url_header = 'error';

			var datos_post = {'_s': session};
			var file_contents = post_urlsource(url_servidor,datos_post);

			url = 'http://links.pordescargadirecta.com' + extraer_texto(file_contents,'<a class="episodeText" href="','"'); 
			file_contents = get_urlheaders(url);
			url_header = file_contents.multiheaders['Location'][0];

		return url_header;	
		}


		//Metodos Privados

		function parsepordedeseriestipobusqueda(page, url_servidor)	{
			//http://www.pordede.com/search/
			var array_playlist=[];
			var texto_busqueda=that.cuadroBuscar();
			if(texto_busqueda!= undefined)
				{
				url_servidor=unescape(url_servidor);
				page.metadata.title = "Pordede -Buscar - " + texto_busqueda;	
				url_servidor=escape(unescape(url_servidor) + texto_busqueda); 
				array_playlist=parsepordedepeliculastipo1(url_servidor);
				}
			return array_playlist;
		}

		function parsepordedeserie(page, url_serie)	{
			//http://www.pordede.com/serie/***************
			url_serie=unescape(url_serie);
			var file_contents = get_urlsource(url_serie);

			file_contents = that.checkloginpordede(url_serie, file_contents);
			if(file_contents!=false)
				{		
				var array_aux = extraer_html_array(file_contents,'<div class="info">','</div></div>');
				var titulo = extraer_texto(file_contents,'<meta property="og:title" content="','"');
				var imagen = extraer_texto(file_contents,'<meta property="og:image" content="','"');
				var url_video;
				file_contents = "";
				var page_uri = ':verenlaces:pordedeseries:';
				var array_playlist=[];
				page.metadata.title = 'Pordede - ' + titulo;
				for (var i=0;i<array_aux.length;i++)
					{
					titulo = extraer_texto(array_aux[i],'<span class="number">','</div>');
					titulo = titulo.replace(/<\/span>/g,'');
					//imagen='http://www.pordede.com' + extraer_texto(array_aux[i],'src="','"');
					url_video='http://www.pordede.com' + extraer_texto(array_aux[i],'href="','"');
					array_playlist.push(new Item_menu(titulo,imagen,page_uri,url_video));
					}
				}
			return array_playlist;
		}


	}
	//Propiedades y metodos Estaticos
	Pordedeseries.padre='Pordede';
	Pordedeseries.categoria= function() {return 'series';}
	Pordedeseries.getitem= function() {return new Item_menu('Pordede',"img/pordede.png",':vercanales:pordedeseries');}

	CanalFactory.registrarCanal("Pordedeseries",Pordedeseries); //Registrar la clase Pordede

	/************************************************************************************************
	/* var Newpctseries: Objeto que representa el canal Newpctseries en Series. Hereda de Newpct	*
	/***********************************************************************************************/
	var Newpctseries= function() {	
		var that=this; //Permite el acceso a metodos publicos desde metodos privados (closures): that.metodo_publico()



		//metodos publicos

		/************************************************************************
		/*	funcion getmenu: Devuelve un listado de las subsecciones del canal. *
		/*	Parametros: ninguno													*
		/*	Retorna: Array de objetos Item_menu									*
		/************************************************************************/
		this.getmenu= function(){
		//retorna el Menu
			var array_menu=[
				new Item_menu('Ultimos Capitulos','views/img/folder.png',':vercontenido:newpctseries:ultimoscapitulos:'+ escape('http://www.newpct1.com/series-alta-definicion-hd/')),
				new Item_menu('Orden Alfabetico','views/img/folder.png',':alfabeto:newpctseries:09'),
				new Item_menu('Buscar Serie HD','views/img/search.png',':vercontenido:newpctseries:tipobusqueda:'+ escape('http://www.newpct1.com/buscar-descargas/'))
				];
		return array_menu;
		}

		/************************************************************************************
		/*	funcion getplaylist: Devuelve un listado del contenido de las subsecciones.     *
		/*	Parametros: 																    *
		/*		page: referencia a la pagina de showtime desde donde se llama a la funcion. * 																*
		/*		tipo: especifica los diferentes tipos de listas soportados por el canal.    *
		/*		url: direccion de la que se debe extraer la lista.							*
		/*	Retorna: Array de objetos Item_menu											    *
		/************************************************************************************/
		this.getplaylist= function (page, tipo, url) {
			var array_playlist=[];
			switch (tipo)
				{
				case "ultimoscapitulos": 
					page.metadata.title = "NewPct Series HD";
					var url_2=escape('http://www.newpct1.com/include.inc/ajax.php/orderCategory.php?type=todo&leter=&sql=SELECT+DISTINCT+++%09%09%09%09%09%09torrentID%2C+++%09%09%09%09%09%09torrentCategoryID%2C+++%09%09%09%09%09%09torrentCategoryIDR%2C+++%09%09%09%09%09%09torrentImageID%2C+++%09%09%09%09%09%09torrentName%2C+++%09%09%09%09%09%09guid%2C+++%09%09%09%09%09%09torrentShortName%2C++%09%09%09%09%09%09torrentLanguage%2C++%09%09%09%09%09%09torrentSize%2C++%09%09%09%09%09%09calidad+as+calidad_%2C++%09%09%09%09%09%09torrentDescription%2C++%09%09%09%09%09%09torrentViews%2C++%09%09%09%09%09%09rating%2C++%09%09%09%09%09%09n_votos%2C++%09%09%09%09%09%09vistas_hoy%2C++%09%09%09%09%09%09vistas_ayer%2C++%09%09%09%09%09%09vistas_semana%2C++%09%09%09%09%09%09vistas_mes++%09%09%09%09++FROM+torrentsFiles+as+t+WHERE++(torrentStatus+%3D+1+OR+torrentStatus+%3D+2)++AND+(torrentCategoryID+IN+(1772%2C+1582%2C+1473%2C+1708%2C+1474%2C+1603%2C+1596%2C+1611%2C+1693%2C+1699%2C+1759%2C+1769%2C+1598%2C+1514%2C+1605%2C+1585%2C+1472%2C+1754%2C+1689%2C+1475%2C+1687%2C+1649%2C+1643%2C+1476%2C+1486%2C+1618%2C+1490%2C+1657%2C+1606%2C+1498%2C+1493%2C+1639%2C+1488%2C+1684%2C+1505%2C+1691%2C+1495%2C+1624%2C+1470%2C+1746%2C+1676%2C+1629%2C+1511%2C+1748%2C+1677%2C+1484%2C+1485%2C+1580%2C+1763%2C+1744%2C+1481%2C+1520%2C+1696%2C+1492%2C+1508%2C+1727%2C+1711%2C+1579%2C+1489%2C+1706%2C+1757%2C+1487%2C+1583%2C+1477%2C+1701%2C+1518%2C+1526%2C+1654%2C+1694%2C+1491%2C+1478%2C+1681%2C+1714%2C+1668%2C+1619%2C+1581%2C+1479%2C+1483%2C+1500%2C+1729%2C+1584%2C+1740%2C+1602%2C+1646%2C+1656%2C+1471%2C+1469))++AND+home_active+%3D+0++++ORDER+BY+torrentDateAdded++DESC++LIMIT+0%2C+50&pag=1&tot=&ban=3&cate=1469');
					var params={'url_servidor': unescape(url_2),
								'page_uri': ':verenlaces:newpctseries:',
								'uri_siguiente': ':vercontenido:newpctseries:tipo1:',
								'subtitulo': true}
					array_playlist=this.parsenewpcttipodefault(url,params);
					break;
				case "tipobusqueda":
					page.metadata.title = "NewPct Series HD - Buscar - "; 
					array_playlist=this.parsenewpcttipobusqueda(page,url, 1469);
					break;
				case "tipo1":
					var params={'url_servidor': unescape(url),
								'page_uri': ':verenlaces:newpctseries:',
								'uri_siguiente': ':vercontenido:newpctseries:tipo1:',
								'subtitulo': true}
					array_playlist= that.parsenewpct (params);
					break;
				case "alfabeto":
					page.metadata.title = "NewPct Series HD - Orden Alfabetico: " + ((url=='09')?'0-9': url.toUpperCase()); //en este caso url almacena la letra a buscar
					var url_2=escape('http://www.newpct1.com/include.inc/ajax.php/orderCategory.php?type=letter&leter=' + url + '&sql=SELECT+DISTINCT+++%09%09%09%09%09%09torrentID%2C+++%09%09%09%09%09%09torrentCategoryID%2C+++%09%09%09%09%09%09torrentCategoryIDR%2C+++%09%09%09%09%09%09torrentImageID%2C+++%09%09%09%09%09%09torrentName%2C+++%09%09%09%09%09%09guid%2C+++%09%09%09%09%09%09torrentShortName%2C++%09%09%09%09%09%09torrentLanguage%2C++%09%09%09%09%09%09torrentSize%2C++%09%09%09%09%09%09calidad+as+calidad_%2C++%09%09%09%09%09%09torrentDescription%2C++%09%09%09%09%09%09torrentViews%2C++%09%09%09%09%09%09rating%2C++%09%09%09%09%09%09n_votos%2C++%09%09%09%09%09%09vistas_hoy%2C++%09%09%09%09%09%09vistas_ayer%2C++%09%09%09%09%09%09vistas_semana%2C++%09%09%09%09%09%09vistas_mes++%09%09%09%09++FROM+torrentsFiles+as+t+WHERE++(torrentStatus+%3D+1+OR+torrentStatus+%3D+2)++AND+(torrentCategoryID+IN+(1772%2C+1582%2C+1473%2C+1708%2C+1474%2C+1603%2C+1596%2C+1611%2C+1693%2C+1699%2C+1759%2C+1769%2C+1598%2C+1514%2C+1605%2C+1585%2C+1472%2C+1754%2C+1689%2C+1475%2C+1687%2C+1649%2C+1643%2C+1476%2C+1486%2C+1618%2C+1490%2C+1657%2C+1606%2C+1498%2C+1493%2C+1639%2C+1488%2C+1684%2C+1505%2C+1691%2C+1495%2C+1624%2C+1470%2C+1746%2C+1676%2C+1629%2C+1511%2C+1748%2C+1677%2C+1484%2C+1485%2C+1580%2C+1763%2C+1744%2C+1481%2C+1520%2C+1696%2C+1492%2C+1508%2C+1727%2C+1711%2C+1579%2C+1489%2C+1706%2C+1757%2C+1487%2C+1583%2C+1477%2C+1701%2C+1518%2C+1526%2C+1654%2C+1694%2C+1491%2C+1478%2C+1681%2C+1714%2C+1668%2C+1619%2C+1581%2C+1479%2C+1483%2C+1500%2C+1729%2C+1584%2C+1740%2C+1602%2C+1646%2C+1656%2C+1471%2C+1469))++AND+home_active+%3D+0++++ORDER+BY+torrentDateAdded++DESC++LIMIT+0%2C+50&pag=1&tot=&ban=3&cate=1469');
					var params={'url_servidor': unescape(url_2),
								'page_uri': ':vercontenido:newpctseries:getCapitulos:',
								'uri_siguiente': ':vercontenido:newpctseries:tipo2:', //el tipo2 no esta implementado por q no contemplamos paginacion aqui
								'subtitulo': false}
					array_playlist= that.parsenewpct (params);
					break;
				case "getCapitulos":
					page.metadata.title = "NewPct Series HD";
					array_playlist=parsenewpctseriesCapitulos(url);
					break;
				}
		return array_playlist;
		}



		/****************************************************************************************
		/*	funcion getservidores: Devuelve un listado de enlaces a la pelicula en los 			*
		/*							servidores soportados. Sustituye a parseXXXXXpelicula (url)	*
		/*	Parametros: 																    	*
		/*		url: direccion de la que se debe extraer la lista.								*
		/*	Retorna: Array de servidores												    	*
		/****************************************************************************************/
		this.getservidores= function (url){
			var array_servidores=[];
			url=unescape(url);
			var file_contents = get_urlsource(url);

			var titulo;
			var imagen;
			var url_host;
			var servidor;
			var idioma;
			var calidad;
			var descripcion;

			//check login
			file_contents = this.checkloginnewpct(url, file_contents);
			if(file_contents!=false)
			{
				//item_Actual
				imagen = extraer_texto(file_contents ,'<div id="left_ficha">','" />');
				imagen = extraer_texto(imagen,"src='","'"); 
				var capitulo = extraer_texto(file_contents,'<h3 class="subtitle" id="subtitle_ficha">','</h3>');
				capitulo=capitulo.match(/Cap\.\s*\d{3,4}/)

				titulo = extraer_texto(file_contents ,'<h2 class="title" id="title_ficha" itemprop="name"><a href="#content-iframe"','</h2>');
				titulo = extraer_texto(titulo,'>','</a>') +  ' ' + (capitulo?capitulo[0]:'');
				descripcion = extraer_texto(file_contents ,' itemprop="description"  >',"</div>"); 

				this.item_Actual=new Item_menu(titulo,imagen,null,url,descripcion);

				file_contents = extraer_texto(file_contents,"<thead id='ver-online'>","</table>");
				file_contents = extraer_texto(file_contents,'<tbody>','</tbody>');

				var array_aux = extraer_html_array(file_contents,'<tr','</tr>');
				file_contents = "";

				var array_aux2=[];
				for (var i=0;i<array_aux.length;i++)
					{
					if(array_aux[i].indexOf('<td>ver en 1 Link</td>')!='-1')
						{
						url_host = extraer_texto(array_aux[i],"<a href='","'");
						array_aux2 = extraer_html_array(array_aux[i],'<td>','</td>');
						servidor = extraer_texto(array_aux2[0],'<td>','</td>');	
						idioma = extraer_texto(array_aux2[1],'<td>','</td>');
						calidad = extraer_texto(array_aux2[2],'<td>','</td>');

						var params={
							"url_host" : url_host,
							"servidor" : servidor,
							"idioma" : idioma,
							"calidad" : calidad
						};

						var objHost=HostFactory.createHost(servidor,params)
						if (objHost)
							{ 
								array_servidores.push(objHost);
							} 
						}
					}

			}
		return array_servidores;
		}

		/************************************************************************************
		/*	funcion getitem_alfabeto: Devuelve un listado de las subsecciones del canal. 	*
		/*	Parametros: ninguno																*
		/*	Retorna:Un objetos Item_menu												*
		/***********************************************************************************/
		this.getitem_alfabeto= function() {
			return (new Item_menu("NewPct Series HD - Orden Alfabetico","views/img/folder.png",':vercontenido:newpctseries:alfabeto:'));
		}


		//Metodos privados
		function parsenewpctseriesCapitulos (url_servidor)
			{
			url_servidor=unescape(url_servidor);
			var file_contents = get_urlsource(url_servidor);
			var array_aux = extraer_html_array(file_contents,"<li class='subitem","</li>");

			var titulo;
			var imagen=extraer_texto(file_contents,'<img  itemprop="image" src=',"' alt=").substring(1);
			file_contents = "";

			var url_video;	
			var page_uri = ':verenlaces:newpctseries:';
			var array_playlist=[];

			for (var i=0;i<array_aux.length;i++)
				{
				titulo=extraer_texto(array_aux[i],"title='","'>");
				url_video=extraer_texto(array_aux[i],"<a href='","'");

				array_playlist.push(new Item_menu(titulo,imagen,page_uri,url_video));	
			}

		return array_playlist;	
		}
	}
	//Propiedades y metodos Estaticos
	Newpctseries.padre='Newpct';
	Newpctseries.categoria= function() {return 'series';}
	Newpctseries.getitem= function() {return new Item_menu('Newpct HD',"img/newpct.png",':vercanales:newpctseries');}

	CanalFactory.registrarCanal("newpctseries",Newpctseries); //Registrar la clase Newpctseries


	/************************************************************************************
	/* var AnimeFlv: Objeto que representa el canal AnimeFlv Pepito en Anime			*
	/************************************************************************************/
	var AnimeFlv= function() {	
		var that=this; //Permite el acceso a metodos publicos desde metodos privados (closures): that.metodo_publico()
		//metodos publicos

		/************************************************************************
		/*	funcion getmenu: Devuelve un listado de las subsecciones del canal. *
		/*	Parametros: ninguno													*
		/*	Retorna: Array de objetos Item_menu									*
		/************************************************************************/
		this.getmenu= function(){
		//retorna el Menu
			var array_menu=[
				new Item_menu('Ultimos Episodios','views/img/folder.png',':vercontenido:animeflv:tipoultimosepisodios:' + escape('http://animeflv.net/')),
				new Item_menu('Mas Vistos Ayer','views/img/folder.png',':vercontenido:animeflv:tipomasvistosayer:' + escape('http://animeflv.net/')),
				new Item_menu('Ultimas Entradas','views/img/folder.png',':vercontenido:animeflv:tipoultimasentradas:' + escape('http://animeflv.net/')),
				//new Item_menu('Listado Alfabetico','views/img/folder.png',':alfabeto:animeflv'),
				new Item_menu('Listado Alfabetico','views/img/folder.png',':alfabeto:animeflv:0-9'),
				new Item_menu('Buscar','views/img/search.png',':vercontenido:animeflv:tipobusqueda:' + escape('http://animeflv.net/animes/?buscar='))
				];
		return array_menu;
		}

		/************************************************************************************
		/*	funcion getplaylist: Devuelve un listado del contenido de las subsecciones.     *
		/*	Parametros: 																    *
		/*		page: referencia a la pagina de showtime desde donde se llama a la funcion. * 																*
		/*		tipo: especifica los diferentes tipos de listas soportados por el canal.    *
		/*		url: direccion de la que se debe extraer la lista.							*
		/*	Retorna: Array de objetos Item_menu											    *
		/************************************************************************************/
		this.getplaylist= function (page, tipo, url) 
		{
			var array_playlist=[];
			switch (tipo)
			{
				case "tipoultimosepisodios":
					array_playlist=parseanimeflvtipoultimoscapitulos(url, page);
					break;
				case "tipomasvistosayer":
					array_playlist=parseanimeflvtipomasvistosayer(url, page);
					break;
				case "tipoultimasentradas":
					array_playlist=parseanimeflvtipoultimasentradas(url, page);
					break;
				case "tipolistado":
					array_playlist=parseanimeflvtipolistado(url, page);
					break;
				case "tipobusqueda":
					array_playlist=parseanimeflvtipobusqueda(url, page);
					break;
				case "tiposerie":
					array_playlist=parseanimeflvtiposerie(url, page);
					break;					
			}
		return array_playlist;
		}

		/****************************************************************************************
		/*	funcion getservidores: Devuelve un listado de enlaces a la pelicula en los 			*
		/*							servidores soportados. Sustituye a parseXXXXXpelicula (url)	*
		/*	Parametros: 																    	*
		/*		url: direccion de la que se debe extraer la lista.								*
		/*	Retorna: Array de servidores												    	*
		/****************************************************************************************/
		this.getservidores= function (url)
		{
			url=unescape(url);
			var file_contents = get_urlsource(url);

			var titulo;
			var imagen;
			var url_video;
			var servidor;
			var idioma;
			var calidad;
			var descripcion;

			//item_Actual
			titulo = extraer_texto(file_contents ,'<meta property="og:title" content="','"');
			imagen = plugin.path + 'views/img/folder.png';
			descripcion = '';

			this.item_Actual=new Item_menu(titulo,imagen,null,url,descripcion);

			var aux_string = extraer_texto(file_contents, 'var videos','};');
			file_contents = "";
			var array_aux = extraer_html_array(aux_string,'[',']');

			//var servidor;
			//var idioma;
			//var calidad;		
			var array_servidores=[];
			var array_aux2=[];
			//imagen=extraer_texto(file_contents,'<div class="profile-info">','/>');
			file_contents ="";
			//imagen=extraer_texto(imagen,'<img src="','"');

			for (var i=0;i<array_aux.length;i++)
			{
				array_aux2 = array_aux[i].split(',');

				servidor = array_aux2[9];
				servidor = servidor.replace(/"/g,'');
				idioma = array_aux2[0] + ' Sub ' + array_aux2[1];
				idioma = idioma.replace(/"/g,'');
				idioma = idioma.replace(/(\[)/g,'');

				url = array_aux2[10];	
				switch (url.substr(1,6))
				{
					case "<embed":
						url = 'http://animeflv.net' + extraer_texto(url,'flashvars=\\"file=\\','&');
						break;
					case "<objec":
						url = extraer_texto(array_aux2[12],'&proxy.link=','\\"');
						url = url.replace(/-hd/g,'');
						break;
					case "<ifram":
						url = extraer_texto(url,'src=\\"','\\"');
						if(url.indexOf('embed.novamov.com')!='-1') {url = 'http://www.novamov.com/video/' + extraer_texto(url,'v=','&');}
						if(url.indexOf('embed.videoweed.es')!='-1') {url = 'http://www.videoweed.es/file/' + extraer_texto(url,'v=','&');}
						break;									
				}

				url = url.replace(/(\\\/)/g,'/');

				var params={
						"url_host" : url,
						"servidor" : servidor,
						"idioma" : idioma,
						"calidad" : calidad
						};

				var objHost=HostFactory.createHost(servidor,params)
				if (objHost)
					{
						array_servidores.push(objHost);
					}				
			}	

		return array_servidores;
		}

		/************************************************************************
		/*	funcion gethost: Devuelve la url del host donde se aloja el video	*
		/*					 Sustituye a resolveXXXXXXpelicula(url)				*
		/*	Parametros:															*
		/*		url: direccion de la que se debe extraer la lista.				*
		/*	Retorna: String que representa la url								*
		/************************************************************************/
		this.geturl_host= function (url){

			return url;		
		}

		/************************************************************************************
		/*	funcion getitem_alfabeto: Devuelve un listado de las subsecciones del canal. 	*
		/*	Parametros: ninguno																*
		/*	Retorna:Un objetos Item_menu												*
		/***********************************************************************************/
		this.getitem_alfabeto= function() {
			return (new Item_menu("AnimeFlv - Orden Alfabetico","views/img/folder.png",':vercontenido:animeflv:tipolistado:','http://animeflv.net/animes/letra/'));
		}

		//Metodos Privados
		function parseanimeflvtipoultimoscapitulos(url_servidor, page)
		{
			//http://animeflv.net/
			url_servidor=unescape(url_servidor);
			page.metadata.title = 'AnimeFLV - Ultimos Episodios Agregados';

			var file_contents = get_urlsource(url_servidor);

			var aux_string = extraer_texto(file_contents, '<h1>Ultimos Episodios Agregados</h1>', '<div class="bloque_der">');
			var array_aux = extraer_html_array(aux_string,'<a','</a>');

			var titulo;
			var imagen;
			var url_video;	
			var page_uri = ':verenlaces:animeflv:';
			var array_playlist=[];


			//Empiezo en en i=1 x el q 0 siempre es publicidad
			/*for (var i=1;i<array_aux.length;i++)
				{
				
					url_video='http://animeflv.net' + url_video;
					titulo=extraer_texto(array_aux[i],'<span class="tit">','</span>');
					imagen=extraer_texto(array_aux[i],'src="','"');
					url_video='http://animeflv.net' + extraer_texto(array_aux[i],'href="','"');
					
					array_playlist.push(new Item_menu(titulo,imagen,page_uri,url_video));
				
				}*/

			//Empiezo en en i=1 x el q 0 siempre es publicidad
			for (var i=1;i<array_aux.length;i++)
				{
				titulo=extraer_texto(array_aux[i],'<span class="tit">','</span>');
				imagen=extraer_texto(array_aux[i],'src="','"');
				url_video='http://animeflv.net' + extraer_texto(array_aux[i],'href="','"');

				array_playlist.push(new Item_menu(titulo,imagen,page_uri,url_video));
			}

		return array_playlist;
		}

		function parseanimeflvtipomasvistosayer(url_servidor, page)
		{
			//http://animeflv.net/
			url_servidor=unescape(url_servidor);
			page.metadata.title = 'AnimeFLV - Mas Vistos Ayer';

			var file_contents = get_urlsource(url_servidor);

			var aux_string = extraer_texto(file_contents, '<ul class="lista_simple lista_estrella">', '</ul>');
			var array_aux = extraer_html_array(aux_string,'<li>','</li>');

			var titulo;
			var imagen = plugin.path + 'views/img/folder.png';
			var url_video;	
			var page_uri = ':verenlaces:animeflv:';
			var array_playlist=[];

			for (var i=0;i<array_aux.length;i++)
			{
				titulo=extraer_texto(array_aux[i],'">','</a></li>');
				url_video='http://animeflv.net' + extraer_texto(array_aux[i],'href="','">');

				array_playlist.push(new Item_menu(titulo,imagen,page_uri,url_video));	
			}

		return array_playlist;
		}

		function parseanimeflvtipoultimasentradas(url_servidor, page)
		{
			//http://animeflv.net/
			url_servidor=unescape(url_servidor);
			page.metadata.title = 'AnimeFLV - Ultimas Entradas';

			var file_contents = get_urlsource(url_servidor);

			var aux_string = extraer_texto(file_contents, '<ul class="lista_simple lista_tv">', '</ul>');
			var array_aux = extraer_html_array(aux_string,'<li>','</li>');

			var titulo;
			var imagen = plugin.path + 'views/img/folder.png';
			var url_video;	
			var page_uri = ':vercontenido:animeflv:tiposerie:';
			var array_playlist=[];

			for (var i=0;i<array_aux.length;i++)
			{
				titulo=extraer_texto(array_aux[i],'">','</a></li>');
				url_video='http://animeflv.net' + extraer_texto(array_aux[i],'href="','">');

				array_playlist.push(new Item_menu(titulo,imagen,page_uri,url_video));						
			}

		return array_playlist;
		}


		function parseanimeflvtipolistado(url_servidor, page)
		{
			//http://animeflv.net/animes/letra/(letra)
			url_servidor=unescape(url_servidor) + '/';
			var file_contents = get_urlsource(url_servidor);

			var aux_string = extraer_texto(file_contents,'<div style="margin-right: -20px;">','<div class="clear"></div>');
			var array_aux = extraer_html_array(aux_string,'<div class="aboxy_lista">','</div>');

			var titulo;
			var imagen;
			var url_video;	
			var page_uri = ':vercontenido:animeflv:tiposerie:';
			var array_playlist=[];

			titulo=extraer_texto(file_contents,'/" class="actual">','</a>');
			page.metadata.title = 'AnimeFLV - ' + titulo;


			for (var i=0;i<array_aux.length;i++)
			{
				titulo=extraer_texto(array_aux[i],'title="','"');
				imagen=extraer_texto(array_aux[i],'data-original="','"');
				url_video='http://animeflv.net' + extraer_texto(array_aux[i],'<a href="','"');

				array_playlist.push(new Item_menu(titulo,imagen,page_uri,url_video));	
			}

			//Paginador
			aux_string = extraer_texto(file_contents,'<div class="pagin">','</div>');
			file_contents = "";
			var check_pagina = aux_string.indexOf('&raquo');

			page_uri=':vercontenido:animeflv:tipolistado:';

			if(check_pagina!=-1)
			{
				var pos_ini = aux_string.lastIndexOf('<a href="')
				aux_string = aux_string.substr(pos_ini);
				aux_string = extraer_texto(aux_string,'<a href="','"');

				array_playlist.push(new Item_menu('Siguiente',"views/img/siguiente.png",page_uri,'http://animeflv.net' + aux_string));
			}

		return array_playlist;
		}


		function parseanimeflvtipobusqueda(url_servidor,page)
		{
			url_servidor=unescape(url_servidor);
			var array_playlist=[];

			var texto_busqueda=that.cuadroBuscar('Buscar (minimo 4 caracteres):');
			if ( texto_busqueda != undefined) 
				{	
					page.metadata.title = 'AnimeFLV - Buscar: ' + texto_busqueda;
					texto_busqueda = texto_busqueda.replace(/ /g,'+');

					var file_contents = get_urlsource(url_servidor + texto_busqueda);

					var resultados = file_contents.indexOf('No se encontraron resultados');
					if(resultados==-1)
					{
						var aux_string = extraer_texto(file_contents ,'<div style="margin-right: -20px;">','<div class="clear"></div>');
						var array_aux = extraer_html_array(aux_string,'<div class="aboxy_lista">','</div>');

						var titulo;
						var imagen;
						var url_video;	
						var page_uri = ':vercontenido:animeflv:tiposerie:';
						var array_playlist=[];

						for (var i=0;i<array_aux.length;i++)
						{
							titulo=extraer_texto(array_aux[i],'title="','"');
							imagen=extraer_texto(array_aux[i],'data-original="','"');
							url_video='http://animeflv.net' + extraer_texto(array_aux[i],'<a href="','"');

							array_playlist.push(new Item_menu(titulo,imagen,page_uri,url_video));
						}


						//Paginador	
						aux_string = extraer_texto(file_contents,'<div class="pagin">','</div>');
						file_contents = "";
						var check_pagina = aux_string.indexOf('&raquo');
						page_uri=':vercontenido:animeflv:tipolistado:';

						if(check_pagina!=-1)
						{
							var pos_ini = aux_string.lastIndexOf('<a href="')
							aux_string = aux_string.substr(pos_ini);
							aux_string = extraer_texto(aux_string,'<a href="','"');

							array_playlist.push(new Item_menu('Siguiente',"views/img/siguiente.png",page_uri,'http://animeflv.net' + aux_string));	
						}

						return array_playlist;
					}
				}
			showtime.notify('No se encontraron resultados', 3)
		return array_playlist;
		}

		function parseanimeflvtiposerie(url_serie, page)
		{
			url_serie=unescape(url_serie);
			var file_contents = get_urlsource(url_serie);

			var titulo;
			var imagen;
			var url_video;	
			var page_uri = ':verenlaces:animeflv:';

			titulo=extraer_texto(file_contents,'<h1>','</h1>');
			page.metadata.title = 'AnimeFLV - ' + titulo;

			imagen = extraer_texto(file_contents ,'<div class="anime_info">','</div>');
			imagen = extraer_texto(imagen ,'src="','"');		

			file_contents = extraer_texto(file_contents,'<ul class="anime_episodios"','</ul>');
			var array_aux = extraer_html_array(file_contents,'<li>','</li>');
			file_contents = "";
			var array_playlist=[];

			for (var i=0;i<array_aux.length;i++)
			{
				url_video= extraer_texto(array_aux[i],'href="','"');
				url_video='http://animeflv.net' + url_video;
				titulo=extraer_texto(array_aux[i],'">','</a>');

				array_playlist.push(new Item_menu(titulo,imagen,page_uri,url_video));	

			}

		return array_playlist;
		}
	}
	AnimeFlv.categoria= function() {return 'anime';}
	AnimeFlv.getitem= function() {return new Item_menu('AnimeFLV',"img/animeflv.png",':vercanales:animeflv');}

	CanalFactory.registrarCanal("AnimeFlv",AnimeFlv); //Registrar la clase AnimeFlv

	/************************************************************************************
	/* var Redtube: Objeto que representa el canal Redtube en Adultos					*
	/************************************************************************************/
	var Redtube= function() {	
		var that=this; //Permite el acceso a metodos publicos desde metodos privados (closures): that.metodo_publico()
		//metodos publicos

		/************************************************************************
		/*	funcion getmenu: Devuelve un listado de las subsecciones del canal. *
		/*	Parametros: ninguno													*
		/*	Retorna: Array de objetos Item_menu									*
		/************************************************************************/
		this.getmenu= function(){
		//retorna el Menu
			var array_menu=[
				new Item_menu('New Videos','views/img/folder.png', ':vercontenido:redtube:New Videos:' + escape('http://www.redtube.com')),
				new Item_menu('Top Videos','views/img/folder.png',':vercontenido:redtube:Top Videos:' + escape('http://www.redtube.com/top')),
				new Item_menu('Buscar','views/img/search.png',':vercontenido:redtube:tipobusqueda:' + escape('http://www.redtube.com/?search='))
				];
		return array_menu;
		}

		/************************************************************************************
		/*	funcion getplaylist: Devuelve un listado del contenido de las subsecciones.     *
		/*	Parametros: 																    *
		/*		page: referencia a la pagina de showtime desde donde se llama a la funcion. * 																*
		/*		tipo: especifica los diferentes tipos de listas soportados por el canal.    *
		/*		url: direccion de la que se debe extraer la lista.							*
		/*	Retorna: Array de objetos Item_menu											    *
		/************************************************************************************/
		this.getplaylist= function (page, tipo, url) {

			var array_playlist = [];
			switch (tipo)
			{
				case "tipobusqueda":
					array_playlist=parseredtubebusqueda(page, url);
					break;
				default:
					page.metadata.title = 'Redtube - ' + tipo;
					array_playlist=parseredtube(url);
					break;
			}
		return array_playlist;
		}

		/****************************************************************************************
		/*	funcion getservidores: Devuelve un listado de enlaces a la pelicula en los 			*
		/*							servidores soportados. Sustituye a parseXXXXXpelicula (url)	*
		/*	Parametros: 																    	*
		/*		url: direccion de la que se debe extraer la lista.								*
		/*	Retorna: Array de servidores												    	*
		/****************************************************************************************/
		this.getservidores= function (url)
		{
			url=unescape(url);
			var file_contents = get_urlsource(url);

			var titulo;
			var imagen;
			var url_video;
			var servidor='redtube';
			var idioma;
			var calidad;
			var descripcion;

			//<tr data-server=" to </a></td> </tr>

			//item_Actual
			titulo = extraer_texto(file_contents,'<h1 class="videoTitle">','</h1>');
			imagen = extraer_texto(file_contents,'og:image" content="','"');
			descripcion = '';

			this.item_Actual=new Item_menu(titulo,imagen,null,url,descripcion);



			var array_servidores = [];

			var params={
				"url_host" : url,
				"servidor" : servidor
				};

			var objHost=HostFactory.createHost(servidor,params)
			if (objHost)
				{
					array_servidores.push(objHost);
				}				

		return array_servidores;
		}

		/************************************************************************
		/*	funcion gethost: Devuelve la url del host donde se aloja el video	*
		/*					 Sustituye a resolveXXXXXXpelicula(url)				*
		/*	Parametros:															*
		/*		url: direccion de la que se debe extraer la lista.				*
		/*	Retorna: String que representa la url								*
		/************************************************************************/
		this.geturl_host= function (url){

			return url;		
		}


		//Metodos Privados
		function parseredtube(url)
		{
			url=unescape(url);
			var file_contents = get_urlsource(url);

			var array_aux = extraer_html_array(file_contents,'<div class="video">','</div>');

			file_contents = "";
			//array_aux = limpiar_array(array_aux);

			var titulo;
			var imagen;
			var array_playlist = [];
			var page_uri = ':verenlaces:redtube:';
			for (var i = 0;i<array_aux.length;i++)
			{
				titulo = extraer_texto(array_aux[i],'title="','"');
				imagen = extraer_texto(array_aux[i],'src="','"');
				url = 'http://www.redtube.com' + extraer_texto(array_aux[i],'<a href="','"');
				array_playlist.push(new Item_menu(titulo,imagen,page_uri,url));	
			}

		return array_playlist.uniqueObjects(['url']);
		}

		function parseredtubebusqueda(page,url_servidor)
		{
			url_servidor=unescape(url_servidor);
			var array_playlist = [];

			var texto_busqueda=that.cuadroBuscar();
			if ( texto_busqueda != undefined) 
				{	
					var titulo_page = 'Buscar '+ texto_busqueda + ':';
					texto_busqueda = texto_busqueda.replace(/ /g,'+');
					page.redirect(PREFIX + ':vercontenido:redtube:' + titulo_page + escape(url_servidor + texto_busqueda));
				}
		return array_playlist;
		}

	}
	Redtube.categoria= function() {return 'adultos';}
	Redtube.getitem= function() {return new Item_menu('redtube',"img/redtube.png",':vercanales:redtube');}

	CanalFactory.registrarCanal("Redtube",Redtube); //Registrar la clase Redtube

	/************************************************************************************
	/* var Xvideos: Objeto que representa el canal Xvideos en Adultos					*
	/************************************************************************************/
	var Xvideos= function() {	
		var that=this; //Permite el acceso a metodos publicos desde metodos privados (closures): that.metodo_publico()
		//metodos publicos

		/************************************************************************
		/*	funcion getmenu: Devuelve un listado de las subsecciones del canal. *
		/*	Parametros: ninguno													*
		/*	Retorna: Array de objetos Item_menu									*
		/************************************************************************/
		this.getmenu= function(){
		//retorna el Menu
			var array_menu=[
				new Item_menu('New Videos','views/img/folder.png',':vercontenido:xvideos:New Videos:' + escape('http://www.xvideos.com')),
				new Item_menu('Best Videos','views/img/folder.png',':vercontenido:xvideos:Best Videos:' + escape('http://www.xvideos.com/best')),
				new Item_menu('Buscar','views/img/search.png',':vercontenido:xvideos:tipobusqueda:' + escape('http://www.xvideos.com/?k='))
				];
		return array_menu;
		}

		/************************************************************************************
		/*	funcion getplaylist: Devuelve un listado del contenido de las subsecciones.     *
		/*	Parametros: 																    *
		/*		page: referencia a la pagina de showtime desde donde se llama a la funcion. * 																*
		/*		tipo: especifica los diferentes tipos de listas soportados por el canal.    *
		/*		url: direccion de la que se debe extraer la lista.							*
		/*	Retorna: Array de objetos Item_menu											    *
		/************************************************************************************/
		this.getplaylist= function (page, tipo, url) {
			var array_playlist=[];
			switch (tipo)
			{
				case "tipobusqueda":
					array_playlist=parsexvideosbusqueda(page, url);
					break;
				default:
					page.metadata.title = 'Xvideos - ' + tipo;
					array_playlist=parsexvideos(url);
					break;
			}
		return array_playlist;
		}

		/****************************************************************************************
		/*	funcion getservidores: Devuelve un listado de enlaces a la pelicula en los 			*
		/*							servidores soportados. Sustituye a parseXXXXXpelicula (url)	*
		/*	Parametros: 																    	*
		/*		url: direccion de la que se debe extraer la lista.								*
		/*	Retorna: Array de servidores												    	*
		/****************************************************************************************/
		this.getservidores= function (url)
		{
			url=unescape(url);
			var file_contents = get_urlsource(url);

			var titulo;
			var imagen;
			var url_video;
			var servidor;
			var idioma;
			var calidad;
			var descripcion;


			//item_Actual
			titulo = extraer_texto(file_contents ,'<div id="main">','<script');
			titulo = extraer_texto(titulo ,'<h2>',' <span');
			imagen = extraer_texto(file_contents ,'url_bigthumb=','&amp');
			descripcion = '';

			this.item_Actual=new Item_menu(titulo,imagen,null,url,descripcion);


			var array_servidores=[];

			var params={
				"url_host" : url,
				"servidor" : 'Xvideos'
				};

			var objHost=HostFactory.createHost('Xvideos',params)
			if (objHost)
				{
					array_servidores.push(objHost);
				}				

		return array_servidores;
		}

		/************************************************************************
		/*	funcion gethost: Devuelve la url del host donde se aloja el video	*
		/*					 Sustituye a resolveXXXXXXpelicula(url)				*
		/*	Parametros:															*
		/*		url: direccion de la que se debe extraer la lista.				*
		/*	Retorna: String que representa la url								*
		/************************************************************************/
		this.geturl_host= function (url){

			return url;		
		}


		//Metodos Privados	
		function parsexvideos(url_servidor)
		{
			url_servidor=unescape(url_servidor);
			var file_contents = get_urlsource(url_servidor);

			var array_aux = extraer_html_array(file_contents,'<div class="thumbBlock"','<p class="metadata">');

			file_contents = "";
			//array_aux = limpiar_array(array_aux);

			var titulo;
			var imagen;
			var url_video;	
			var array_playlist=[];
			var page_uri = ':verenlaces:xvideos:';
			for (var i=0;i<array_aux.length;i++)
			{
				titulo=extraer_texto(array_aux[i],'<p><a ','a></p>');
				titulo=extraer_texto(titulo,'">','</');
				imagen=extraer_texto(array_aux[i],'src="','"');
				url_video='http://www.xvideos.com' + extraer_texto(array_aux[i],'<a href="','"');
				array_playlist.push(new Item_menu(titulo,imagen,page_uri,url_video));	
			}

		return array_playlist.uniqueObjects(['url']);
		}		

		function parsexvideosbusqueda(page,url_servidor)
		{
			url_servidor=unescape(url_servidor);
			var array_playlist=[];
			var texto_busqueda=that.cuadroBuscar();
			if ( texto_busqueda != undefined) 
				{	
					var titulo_page = 'Buscar '+ texto_busqueda + ':';
					texto_busqueda = texto_busqueda.replace(/ /g,'+');
					page.redirect(PREFIX + ':vercontenido:xvideos:' + titulo_page + escape(url_servidor + texto_busqueda));	
				}
		return array_playlist;
		}		

	}
	Xvideos.categoria= function() {return 'adultos';}
	Xvideos.getitem= function() {return new Item_menu('XVideos',"img/xvideos.png",':vercanales:xvideos');}

	CanalFactory.registrarCanal("Xvideos",Xvideos); //Registrar la clase Xvideos

	/************************************************************************************
	/* var Xhamster: Objeto que representa el canal Xhamster en Adultos	*
	/************************************************************************************/
	var Xhamster= function() {	
		var that=this; //Permite el acceso a metodos publicos desde metodos privados (closures): that.metodo_publico()
		//metodos publicos

		/************************************************************************
		/*	funcion getmenu: Devuelve un listado de las subsecciones del canal. *
		/*	Parametros: ninguno													*
		/*	Retorna: Array de objetos Item_menu									*
		/************************************************************************/
		this.getmenu= function(){
		//retorna el Menu
			var array_menu=[
				new Item_menu('New Videos','views/img/folder.png',':vercontenido:xhamster:tiponewvideos:' + escape('http://www.xhamster.com')),
				new Item_menu('Top Rated','views/img/folder.png',':vercontenido:xhamster:tipotoprated:' + escape('http://xhamster.com/rankings/weekly-top-videos.html')),
				new Item_menu('Hd Videos','views/img/folder.png',':vercontenido:xhamster:tipohdvideos:' + escape('http://xhamster.com/channels/new-hd_videos-1.html')),
				new Item_menu('Buscar','views/img/search.png',':vercontenido:xhamster:tipobusquedainput:' + escape('http://xhamster.com/search.php?new=&q='))
				];
		return array_menu;
		}

		/************************************************************************************
		/*	funcion getplaylist: Devuelve un listado del contenido de las subsecciones.     *
		/*	Parametros: 																    *
		/*		page: referencia a la pagina de showtime desde donde se llama a la funcion. * 																*
		/*		tipo: especifica los diferentes tipos de listas soportados por el canal.    *
		/*		url: direccion de la que se debe extraer la lista.							*
		/*	Retorna: Array de objetos Item_menu											    *
		/************************************************************************************/
		this.getplaylist= function (page, tipo, url) {
			var array_playlist=[];
			switch (tipo)
			{
				case "tiponewvideos":
					page.metadata.title = "Xhamster - New Videos";
					array_playlist=parsexhamstertipo1(url);
					break;
				case "tipohdvideos":
					page.metadata.title = "Xhamster - HD Videos";
					array_playlist=parsexhamstertipo1(url);
					break;
				case "tipotoprated":
					page.metadata.title = "Xhamster - Top Rated";
					array_playlist=parsexhamstertipotoprated(url);
					break;
				case "tipobusquedainput":
					array_playlist=parsexhamstertipobusquedainput(page, url);
					break;
				case "tipobusqueda":
					array_playlist=parsexhamstertipobusqueda(page, url);
					break;
			}			
		return array_playlist;
		}

		/****************************************************************************************
		/*	funcion getservidores: Devuelve un listado de enlaces a la pelicula en los 			*
		/*							servidores soportados. Sustituye a parseXXXXXpelicula (url)	*
		/*	Parametros: 																    	*
		/*		url: direccion de la que se debe extraer la lista.								*
		/*	Retorna: Array de servidores												    	*
		/****************************************************************************************/
		this.getservidores= function (url)
		{
			url=unescape(url);
			var file_contents = get_urlsource(url);

			var titulo;
			var imagen;
			var url_video;
			var servidor;
			var idioma;
			var calidad;
			var descripcion;

			//item_Actual
			titulo = extraer_texto(file_contents ,'<div class="head gr"><h1>','</h1>');
			imagen = extraer_texto(file_contents ,'<video poster="','"');
			descripcion = '';

			this.item_Actual=new Item_menu(titulo,imagen,null,url,descripcion);


			var array_servidores=[];
			var params={
				"url_host" : url,
				"servidor" : 'xhamster'
				};

			var objHost=HostFactory.createHost('xhamster',params)
			if (objHost)
				{
					array_servidores.push(objHost);
				}				

		return array_servidores;
		}

		/************************************************************************
		/*	funcion gethost: Devuelve la url del host donde se aloja el video	*
		/*					 Sustituye a resolveXXXXXXpelicula(url)				*
		/*	Parametros:															*
		/*		url: direccion de la que se debe extraer la lista.				*
		/*	Retorna: String que representa la url								*
		/************************************************************************/
		this.geturl_host= function (url){
			return url;		
		}


		//Metodos Privados
		function parsexhamstertipo1(url_servidor)
		{
			//http://xhamster.com
			//http://xhamster.com/channels/new-hd_videos-1.html
			url_servidor=unescape(url_servidor);
			var file_contents = get_urlsource(url_servidor);

			var aux_string = extraer_texto(file_contents, "<div class='vDate'>","<div class='pager'>");
			var array_aux = extraer_html_array(file_contents,"<div class='video'>","</div>");

			file_contents = "";
			array_aux.sort();

			var titulo;
			var imagen;
			var url_video;	
			var array_playlist=[];
			var page_uri = ':verenlaces:xhamster:';
			for (var i=0;i<array_aux.length;i++)
			{
				titulo=extraer_texto(array_aux[i],'<u title="','"');
				imagen=extraer_texto(array_aux[i],"src='","'");
				url_video=extraer_texto(array_aux[i],"<a href='","'");
				array_playlist.push(new Item_menu(titulo,imagen,page_uri,url_video));	
			}

		return array_playlist;
		}

		function parsexhamstertipotoprated(url_servidor)
		{
			//http://xhamster.com/rankings/weekly-top-videos.html
			url_servidor=unescape(url_servidor);
			var file_contents = get_urlsource(url_servidor);

			var aux_string = extraer_texto(file_contents, "<table id='vTop'>","</table>");
			var array_aux = extraer_html_array(file_contents,"<div class='video'>","</div>");

			file_contents = "";
			array_aux.sort();

			var titulo;
			var imagen;
			var url_video;	
			var array_playlist=[];
			var page_uri = ':verenlaces:xhamster:';
			for (var i=0;i<array_aux.length;i++)
			{
				titulo=extraer_texto(array_aux[i],"title='","'");
				imagen=extraer_texto(array_aux[i],"src='","'");
				url_video=extraer_texto(array_aux[i],"href='","'");
				array_playlist.push(new Item_menu(titulo,imagen,page_uri,url_video));
			}

		return array_playlist;
		}

		function parsexhamstertipobusquedainput(page,url_servidor)
		{
		var array_playlist=[];
		var texto_busqueda=that.cuadroBuscar();
		if(texto_busqueda!= undefined)
			{
			//view-source:http://xhamster.com/search.php?new=&q=jordan&qcat=video
			url_servidor=escape(unescape(url_servidor) + texto_busqueda + '&qcat=video'); 
			array_playlist=parsexhamstertipobusqueda(page, url_servidor);
			}
		return array_playlist;
		}

		function parsexhamstertipobusqueda(page,url_servidor)
		{
			//http://xhamster.com/search.php?new=&q=(textoabuscar)&qcat=video
			url_servidor=unescape(url_servidor);
			page.metadata.title = "Xhamster - Buscar - " + extraer_texto(url_servidor ,'q=','&qcat');
			var file_contents = showtime.httpReq(url_servidor, 
				{
				debug: false,
				compression: true,
				headers: 
					{
					'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:15.0) Gecko/20100101 Firefox/15.0.1',
					'Cookie': 'videoFilters=%7B%22channels%22%3A%22%3B0%22%7D'
					}
				}).toString();
		//Set-Cookie:videoFilters=%7B%22channels%22%3A%22%3B0%22%7D; expires=Tue, 29-Apr-2014 16:54:22 GMT; path=/; domain=.xhamster.com
		//var file_contents = get_urlsource(url_servidor);

			var resultados = file_contents.indexOf('No video found for this query');
			if(resultados==-1)
			{
				var aux_string = extraer_texto(file_contents ,'<table width="100%"><tr><td>','</table>');
				var array_aux = extraer_html_array(aux_string,"<div class='video'>","</div>");

				var titulo;
				var imagen;
				var url_video;	
				var page_uri = ':verenlaces:xhamster:';
				var array_playlist=[];

				for (var i=0;i<array_aux.length;i++)
				{
					titulo=extraer_texto(array_aux[i],'<u title="','"');
					imagen=extraer_texto(array_aux[i],"src='","'");
					url_video=extraer_texto(array_aux[i],"<a href='","'");
					array_playlist.push(new Item_menu(titulo,imagen,page_uri,url_video));
				}

				//Paginador
				aux_string = extraer_texto(file_contents,"<div class='pager'>","</table></div></div>");
				file_contents = "";
				var check_pagina = aux_string.indexOf('Next');
				page_uri=':vercontenido:xhamster:tipobusqueda:';

				if(check_pagina!=-1)
				{
					var pos_ini = aux_string.indexOf('iconPagerNextHover');
					aux_string = aux_string.substr(0,pos_ini);
					pos_ini = aux_string.lastIndexOf('<a')
					aux_string = aux_string.substr(pos_ini);
					aux_string = extraer_texto(aux_string,"href='","'");
					array_playlist.push(new Item_menu('Siguiente',"views/img/siguiente.png",page_uri,'http://xhamster.com/' + aux_string));
				}
			}
		return array_playlist;
		}

	}
	Xhamster.categoria= function() {return 'adultos';}
	Xhamster.getitem= function() {return new Item_menu('XHamster',"img/xhamster.png",':vercanales:xhamster');}

	CanalFactory.registrarCanal("Xhamster",Xhamster); //Registrar la clase Xhamster

	/************************************************************************************
	/* var Oranline: Objeto que representa el canal Oranline.net en Peliculas	*
	/************************************************************************************/
	var Oranline= function() {	
		var that=this; //Permite el acceso a metodos publicos desde metodos privados (closures): that.metodo_publico()

		//metodos publicos

		/************************************************************************
		/*	funcion getmenu: Devuelve un listado de las subsecciones del canal. *
		/*	Parametros: ninguno													*
		/*	Retorna: Array de objetos Item_menu									*
		/************************************************************************/
		this.getmenu= function(){
		//retorna el Menu
			var array_menu=[
				new Item_menu('Estrenos de cine','views/img/folder.png',':vercontenido:oranline:tipoestrenoscine:'+ escape('http://www.oranline.net/ver/Pel%C3%ADculas/estrenos-de-cine/')),

				new Item_menu('Estrenos Rip','views/img/folder.png',':vercontenido:oranline:tiporip:'+ escape('http://www.oranline.net/ver/Pel%C3%ADculas/estrenos-rip/')),
				new Item_menu('Orden Alfabetico','views/img/folder.png',':alfabeto:oranline:num'), //http://www.oranline.net/?s=letra-a
				new Item_menu('Buscar peliculas','views/img/search.png',':vercontenido:oranline:tipobusqueda:'+ escape('http://www.oranline.net/?s='))
				];
		return array_menu;
		}

		/************************************************************************************
		/*	funcion getplaylist: Devuelve un listado del contenido de las subsecciones.     *
		/*	Parametros: 																    *
		/*		page: referencia a la pagina de showtime desde donde se llama a la funcion. * 																*
		/*		tipo: especifica los diferentes tipos de listas soportados por el canal.    *
		/*		url: direccion de la que se debe extraer la lista.							*
		/*	Retorna: Array de objetos Item_menu											    *
		/************************************************************************************/
		this.getplaylist= function (page, tipo, url) {
			var array_playlist=[];

			var params={'url_servidor': unescape(url),
				'page_uri': ':verenlaces:oranline:',
				'uri_siguiente': ':vercontenido:oranline:tipo1:',
				'subtitulo':false}	

			switch (tipo)
			{
			case "tipoestrenoscine":
				page.metadata.title = "Oranline - Estrenos de Cine";
				array_playlist=parseoranline(params);
				break;
			case "tiporip":
				page.metadata.title = "Oranline - Estrenos Rip";
				array_playlist=parseoranline(params);
				break;
			case "tipo1":
				array_playlist= parseoranline (params);
				break;
			case "alfabeto":
				page.metadata.title = "Oranline - Orden Alfabetico: ";

				if (url.endsWith('num'))
				{ //Alfabeto numerico [0-9]
					url= url.slice(0,url.length - 3);
					for (var i=0;i<10;i++)
						{	
							params.url_servidor= unescape(url + i);	
							array_playlist= array_playlist.concat(parseoranline(params));
						}		
				}else{ //Alfabeto letra
					array_playlist=parseoranline(params);
				}
				break;
			case "tipobusqueda":
				array_playlist=parseoranlinetipobusqueda(params,page);
				break;
			}


		return array_playlist;
		}

		/****************************************************************************************
		/*	funcion getservidores: Devuelve un listado de enlaces a la pelicula en los 			*
		/*							servidores soportados. 										*
		/*	Parametros: 																    	*
		/*		url: direccion de la que se debe extraer la lista.								*
		/*	Retorna: Array de servidores												    	*
		/****************************************************************************************/
		this.getservidores= function (url){
			var array_servidores=[];
			url=unescape(url);
			var file_contents = get_urlsource(url);

			var titulo;
			var imagen;
			var url_host;
			var servidor;
			var idioma;
			var calidad= '';
			var descripcion;

			if(file_contents!=false)
			{
				//item_Actual
				titulo = extraer_texto(file_contents ,'<strong>Titulo:<br />','<br />');
				descripcion = extraer_texto(file_contents ,"<p>Sinopsis:<br />","</p>");
				imagen = extraer_texto(file_contents ,'<div id="review-panel-left"','</div>');
				imagen = extraer_texto(imagen ,'<img src="','"');

				this.item_Actual=new Item_menu(titulo,imagen,null,url,descripcion);

				file_contents = extraer_texto(file_contents,'<div id="veronline">','<div id="review-panels">');
				var array_aux = extraer_html_array(file_contents,'<span><img id','VER AQUÍ');
				file_contents = "";

				var array_aux2=[];
				for (var i=0;i<array_aux.length;i++)
				{
					idioma = extraer_texto(array_aux[i],'="','"');
					if (idioma.toLowerCase()== 'vose') {
						idioma= 'V.O.S.E'
					}else{
						idioma=idioma.toProperCase()
					}				
					url_host = extraer_texto(array_aux[i],'<a target="_blank" href="','">');
					if (url_host =='') continue;

					array_aux2 = extraer_html_array(array_aux[i],'<span>','</span>');
					if (array_aux2.length > 1) calidad = extraer_texto(array_aux2[2],'<span>','</span>');
					servidor = url_host.split('/')[2].match(/\w+/i)[0];

					var params={
						"url_host" : url_host,
						"servidor" : servidor,
						"idioma" : idioma,
						"calidad" : calidad
						};

					var objHost=HostFactory.createHost(servidor,params)
					if (objHost)
						{ 
							array_servidores.push(objHost);
						} 
				}
			}
		return array_servidores;
		}

		/************************************************************************
		/*	funcion gethost: Devuelve la url del host donde se aloja el video	*
		/*	Parametros:															*
		/*		url: direccion de la que se debe extraer la lista.				*
		/*	Retorna: String que representa la url								*
		/************************************************************************/
		this.geturl_host= function (url){
			return url;		
		}

		/************************************************************************************
		/*	funcion getitem_alfabeto: Devuelve un listado de las subsecciones del canal. 	*
		/*	Parametros: ninguno																*
		/*	Retorna:Un objetos Item_menu													*
		/***********************************************************************************/
		this.getitem_alfabeto= function() {
			return (new Item_menu("Oranline.net - Orden Alfabetico","views/img/folder.png",':vercontenido:oranline:alfabeto:','http://www.oranline.net/?s=letra-'));
		}


		//Metodos Privados
		function parseoranline (params) 
		{	
			/*var params={'url_servidor': ,'page_uri': ,'uri_siguiente': ,'subtitulo': }*/
			var numero_pagina = parseInt(extraer_texto(params.url_servidor,"page/","/"));
			numero_pagina=(numero_pagina > 0 )?numero_pagina:1;

			var file_contents = get_urlsource(params.url_servidor);
			var ultima_pagina = extraer_texto(file_contents,'<span class="pages">','</span>');
			ultima_pagina = parseInt(ultima_pagina.substr(ultima_pagina.lastIndexOf("of ") + 3));
			ultima_pagina = (ultima_pagina > 0)?ultima_pagina:numero_pagina;

			file_contents = extraer_texto(file_contents,'<div class="review-box-container">','<h3>Buscador de peliculas</h3>');	
			var array_aux = extraer_html_array(file_contents,'<div class="post-thumbnail">','<div id="campos_idiomas">');
			file_contents = "";

			var titulo;
			var imagen;
			var url_video;	
			var array_playlist=[];

			for (var i=0;i<array_aux.length;i++)
				{


					titulo=extraer_texto(array_aux[i],'title="','">');
					titulo = fixtitles(titulo);

					if (titulo !='') {			
						imagen=extraer_texto(array_aux[i],'<img src="','"');
						url_video=extraer_texto(array_aux[i],'<a href="','"');
						array_playlist.push(new Item_menu(titulo,imagen,params.page_uri,url_video));
					}	
				}

			//paginador
			var pagina_siguiente = (parseInt(numero_pagina) + 1);
			if(numero_pagina<ultima_pagina)
				{ //Aqui hay que contemplar caso especiales:
					if (numero_pagina >1) {
							params.url_servidor=params.url_servidor.replace('page/' + numero_pagina,'page/' + pagina_siguiente);
						}else{
							//Primera pagina ...
							var i= params.url_servidor.indexOf('/?s=');
							if (i > -1){
								//... de tipo alfabeto o busqueda
								var stbuscado= params.url_servidor.substring(i);
								params.url_servidor="http://www.oranline.net/page/2" + stbuscado;
							}else{
								//... de cualquier otro tipo
								params.url_servidor=params.url_servidor + "page/2/";
							}

						}

					array_playlist.push(new Item_menu('Siguiente',"views/img/siguiente.png",params.uri_siguiente,params.url_servidor));		
				}

		return array_playlist;
		}


		function parseoranlinetipobusqueda (params,page)
		{
			var array_playlist=[];

			var texto_busqueda=that.cuadroBuscar();
			if ( texto_busqueda != undefined) 
				{	
					page.metadata.title = "Oranline - Buscar - "  + texto_busqueda;
					texto_busqueda = texto_busqueda.replace(/ /g,'+');

					params.url_servidor= params.url_servidor + texto_busqueda;						
					var file_contents = get_urlsource(params.url_servidor);

					var resultados = file_contents.indexOf('0 Resultados');
					if(resultados==-1){
						array_playlist= parseoranline (params);
						return array_playlist;	
					}	
				}
			showtime.notify('No se encontraron resultados', 3);
		return array_playlist;	
		}

		function fixtitles (titulo)	
		{
			//var array_1 = ['á'    ,'é'    ,'í'    ,'ó'    ,'ú'    ,'Á'     ,'É'     ,'Í'     ,'Ó'      ,'Ú'     ,'ñ'    ,'Ñ'     ,'ü','à' ,'è' ,'ì','ò' ,'ù'];
			var array_1 = [String.fromCharCode(161),String.fromCharCode(169),String.fromCharCode(173),String.fromCharCode(179),String.fromCharCode(186),String.fromCharCode(129),String.fromCharCode(137),String.fromCharCode(141),String.fromCharCode(147),String.fromCharCode(154),String.fromCharCode(177),String.fromCharCode(145),String.fromCharCode(188),String.fromCharCode(160),String.fromCharCode(168),String.fromCharCode(172),String.fromCharCode(178),String.fromCharCode(185)];
			var array_2 = [String.fromCharCode(225),String.fromCharCode(233),String.fromCharCode(237),String.fromCharCode(243),String.fromCharCode(250),String.fromCharCode(193),String.fromCharCode(201),String.fromCharCode(205),String.fromCharCode(211),String.fromCharCode(218),String.fromCharCode(241),String.fromCharCode(209),String.fromCharCode(252),String.fromCharCode(224),String.fromCharCode(232),String.fromCharCode(236),String.fromCharCode(242),String.fromCharCode(249)];
			//String.fromCharCode(195)

			var resultado = titulo;
			for (var i=0;i<array_1.length;i++)
				{
				var reg = new RegExp(String.fromCharCode(195) +  array_1[i],"g");
				resultado = resultado.replace(reg,array_2[i]);
				}
		return resultado;
		}
		
	}
	//Propiedades y metodos Estaticos
	Oranline.categoria= function() {return 'peliculas';}
	Oranline.getitem= function() {return new Item_menu('Oranline',"img/oranline.png",':vercanales:oranline');}

	CanalFactory.registrarCanal("oranline",Oranline); //Registrar la clase Oranline
	
	/************************************************************************************
	/* var Seriesflv: Objeto que representa el canal Seriesflv en Series				*
	/************************************************************************************/
	var Seriesflv= function() {	
		//var that=this; //Permite el acceso a metodos publicos desde metodos privados (closures): that.metodo_publico()
		var descripcion="";
		
		
		//metodos publicos
		
		/************************************************************************
		/*	funcion getmenu: Devuelve un listado de las subsecciones del canal. *
		/*	Parametros: ninguno													*
		/*	Retorna: Array de objetos Item_menu									*
		/************************************************************************/
		this.getmenu= function(){
		//retorna el Menu
			var array_menu=[	
				new Item_menu('Ultimos Cap. Español','views/img/folder.png',':vercontenido:seriesflv:tipocapituloES:'+ escape('http://www.seriesflv.net/')),
				new Item_menu('Ultimos Cap. Latino','views/img/folder.png',':vercontenido:seriesflv:tipocapituloLA:'+ escape('http://www.seriesflv.net/')),
				new Item_menu('Ultimos Cap. VOSE','views/img/folder.png',':vercontenido:seriesflv:tipocapituloVOSE:'+ escape('http://www.seriesflv.net/')),
				new Item_menu('Ultimos Cap. V.O.','views/img/folder.png',':vercontenido:seriesflv:tipocapituloVO:'+ escape('http://www.seriesflv.net/')),
				new Item_menu('Orden Alfabetico','views/img/folder.png',':alfabeto:seriesflv:0-9') 
				];
		return array_menu;
		}
		
		/************************************************************************************
		/*	funcion getplaylist: Devuelve un listado del contenido de las subsecciones.     *
		/*	Parametros: 																    *
		/*		page: referencia a la pagina de showtime desde donde se llama a la funcion. * 																*
		/*		tipo: especifica los diferentes tipos de listas soportados por el canal.    *
		/*		url: direccion de la que se debe extraer la lista.							*
		/*	Retorna: Array de objetos Item_menu											    *
		/************************************************************************************/
		this.getplaylist= function (page, tipo, url) {
			var array_playlist=[];
		
			var params={'url_servidor': unescape(url),
				'page_uri': ':verenlaces:seriesflv:',
				'idioma':''};
		
			switch (tipo)
			{
			case "tipocapituloES":
				page.metadata.title ="Seriesflv - Ultimos Capitulos - Español";
				params.idioma="es";
				array_playlist=parseseriesflv(params);
				break;
			case "tipocapituloLA":
				page.metadata.title ="Seriesflv - Ultimos Capitulos - Latino";
				params.idioma="la";
				array_playlist=parseseriesflv(params);
				break;
			case "tipocapituloVOSE":
				page.metadata.title ="Seriesflv - Ultimos Capitulos - VOSE";
				params.idioma="sub";
				array_playlist=parseseriesflv(params);
				break;
			case "tipocapituloVO":
				page.metadata.title ="Seriesflv - Ultimos Capitulos - VO";
				params.idioma="vo";
				array_playlist=parseseriesflv(params);
				break;
			case "alfabeto":
				page.metadata.title = "Seriesflv - Orden Alfabetico: ";
				params.letra=url;
				params.url_servidor= 'http://www.seriesflv.net/';
				params.page_uri=':vercontenido:seriesflv:tiposerie:'; //+ escape('http://www.seriesflv.net/')
				array_playlist=parseseriesflvalfabeto(params);
				break;
			case "tiposerie":
				array_playlist=parseseriesflvserie(params,page);
				break;
			}
			
		return array_playlist;
		}
		
		/****************************************************************************************
		/*	funcion getservidores: Devuelve un listado de enlaces a la pelicula en los 			*
		/*							servidores soportados. Sustituye a parseXXXXXpelicula (url)	*
		/*	Parametros: 																    	*
		/*		url: direccion de la que se debe extraer la lista.								*
		/*	Retorna: Array de servidores												    	*
		/****************************************************************************************/
		this.getservidores= function (url){
			var array_servidores=[];
			url=unescape(url);
			var file_contents = get_urlsource(url);
			var array_servidores=[];

			var titulo;
			var imagen;
			var url_host;
			var servidor;
			var idioma;
			var calidad= "";
			//var descripcion="";
			
			file_contents = extraer_texto(file_contents,'<div id="serie">',' </table>');
			if(file_contents!=false)
			{
				//item_Actual
				titulo = utf8_decode(extraer_texto(file_contents ,'<h1 class="off">','</h1>'));
				imagen = extraer_texto(file_contents ,'src="','">');
			
				this.item_Actual=new Item_menu(titulo,imagen,null,url,descripcion);
				
				var array_aux = extraer_html_array(file_contents,'<tr>','</tr>');
				file_contents = "";
				
				var l=array_aux.length;
				for (var i=1;i<l;i++)
				{
					var idioma_aux= extraer_texto(array_aux[i] ,'src="','">').split('/');
					idioma=idioma_aux[idioma_aux.length-1];
					switch (idioma)
					{
					case "es.png":
						idioma="Español";
						break;
					case "sub.png":
						idioma="V.O.S.E";
						break;
					case "la.png":
						idioma="Latino";
						break;
					default:
						idioma="VO";
						break;			
					}
				
					url_host = extraer_texto(array_aux[i],'data-uri="','"');
					servidor = url_host.split('/')[2].match(/\w+/i)[0];
				
					var params={
						"url_host" : url_host,
						"servidor" : servidor.toProperCase(),
						"idioma" : idioma,
						"calidad" : calidad
						};
	
					var objHost=HostFactory.createHost(servidor,params)
					if (objHost) array_servidores.push(objHost);		
				}
				
			}
		return array_servidores;
		}
		
		/************************************************************************
		/*	funcion gethost: Devuelve la url del host donde se aloja el video	*
		/*					 Sustituye a resolveXXXXXXpelicula(url)				*
		/*	Parametros:															*
		/*		url: direccion de la que se debe extraer la lista.				*
		/*	Retorna: String que representa la url								*
		/************************************************************************/
		this.geturl_host= function (url){
			
			return url;		
		}
		
		/************************************************************************************
		/*	funcion getitem_alfabeto: Devuelve un listado de las subsecciones del canal. 	*
		/*	Parametros: ninguno																*
		/*	Retorna:Un objetos Item_menu													*
		/***********************************************************************************/
		this.getitem_alfabeto= function() {
			return (new Item_menu("Seriesflv.net - Orden Alfabetico","views/img/folder.png",':vercontenido:seriesflv:alfabeto:'));
		}
		
		
		//Metodos Privados
		function parseseriesflv (params) 
		{	
			var array_playlist=[];
			/*var params={'url_servidor': ,'page_uri': ,'idioma': }*/
			var file_contents = get_urlsource(params.url_servidor);
			
			//Primero recorremos el carrusel para obtener las imagenes ...
			var array_aux = extraer_html_array(file_contents,'<li class="touchcarousel-item">','</li>');
			
			var url_capitulo;
			var array_imagenes= new Array();
			var l=array_aux.length;
			for (var i=0; i<l ;i++)
				{
					url_capitulo= extraer_texto(array_aux[i],'<a href="','"');
					array_imagenes[url_capitulo]= extraer_texto(array_aux[i],'src="','"');
				}
				
			//... despues obtenemos el resto de datos del MAIN-CONT ...
			file_contents = extraer_texto(file_contents,'<div class="header bg3">','<div class="header bg3">');	
			array_aux = extraer_html_array(file_contents,'<a','</a>');
			file_contents = "";
			l=array_aux.length;
			for (var i=0; i<l ;i++)
				{
					var idioma= extraer_texto(array_aux[i],'lang="','"');
					if (idioma !="")
					{
						// ... y los añadimos al playlist si coincide el idioma buscado
						if (((params.idioma=='vo') && (idioma !='es' && idioma !='la' && idioma!='sub')) || (params.idioma==idioma))
						{
							url_capitulo= extraer_texto(array_aux[i],'href="','"');
							var imagen = array_imagenes[url_capitulo];
							if (imagen == undefined) imagen="views/img/nophoto.png";

							var titulo =extraer_texto(array_aux[i],'<div class="i-title">','</div>') + " " + extraer_texto(array_aux[i],'<div class="box-tc">','</div>');
							//titulo = fixtitles(titulo);
							array_playlist.push(new Item_menu(titulo,imagen,params.page_uri,url_capitulo));
						}
					}
				}
				
		return array_playlist;
		}
		
		function parseseriesflvalfabeto (params) 
		{
			var array_playlist=[];
			/*var params={'url_servidor': ,'idioma': ,'letra': }*/
			var file_contents = get_urlsource(params.url_servidor);
			
			//Primero recorremos el carrusel para obtener las imagenes ...
			var array_aux = extraer_html_array(file_contents,'<li class="touchcarousel-item">','</li>');
			
			var titulo
			var array_imagenes= new Array();
			var l=array_aux.length;
			for (var i=0; i<l ;i++)
				{
					titulo= extraer_texto(array_aux[i],'<span>','</span>').trim();
					array_imagenes[titulo]= extraer_texto(array_aux[i],'src="','"');
				}
				
			//... despues obtenemos el resto de datos de la lista de series
			file_contents = extraer_texto(file_contents,'<ul id="list_series_letras"','</ul>');	
			array_aux = extraer_html_array(file_contents,'<span class="title on"','</span>');
			file_contents = "";
			l=array_aux.length;
			for (var i=0; i<l ;i++)
				{
					var url_serie= extraer_texto(array_aux[i],'href="','"');		
	
					titulo = extraer_texto(array_aux[i],'title="','/a>');
					titulo= extraer_texto(titulo,'">','<').trim();
										
					var imagen = array_imagenes [titulo];
					if (imagen == undefined) imagen="views/img/nophoto.png";
					// ... y los añadimos al playlist si el titulo comienza por la letra buscada
					//titulo = fixtitles(titulo);
					switch (params.letra)
					{
						case "0-9": // Si el titulo empieza por un numero
							if (!isNaN(titulo.charAt(0))) 
								array_playlist.push(new Item_menu(titulo,imagen,params.page_uri,url_serie));
							break;
						case "z":
							if (titulo.toLowerCase().startsWith('z') || titulo.toLowerCase().startsWith('¡') || titulo.toLowerCase().startsWith('¿'))
								array_playlist.push(new Item_menu(titulo,imagen,params.page_uri,url_serie));
							break;
						default:
						
							if (titulo.toLowerCase().startsWith(params.letra)){
							
								array_playlist.push(new Item_menu(titulo,imagen,params.page_uri,url_serie));
								}
							break;
					}
				
				
				}
			
		return array_playlist;
		}	
		
		function parseseriesflvserie (params,page) 
		{	//http://www.seriesflv.net/serie/arrow.html
			var array_playlist=[];
			var url_capitulo;
			var file_contents = get_urlsource(params.url_servidor);
			
			var imagen= extraer_texto(file_contents ,'<div class="portada">','</div>');
			imagen=  extraer_texto(imagen ,'src="','">');
			
			descripcion= extraer_texto(file_contents ,'Sinopsis</div>','/p>');
			descripcion= extraer_texto(descripcion ,'>','<');
			
			//titulo pagina
			var titulo = extraer_texto(file_contents ,'<h1 class="off">','</h1>');

			page.metadata.title = "Seriesflv: " + titulo;
			
			file_contents = extraer_texto(file_contents ,'<div id="capitulos">','<div id="comentarios">');
			var array_aux = extraer_html_array(file_contents,' <tr>',' </tr>');
			file_contents ='';
			
			var l=array_aux.length;
			for (var i=1; i<l ;i++)
				{
					url_capitulo= extraer_texto(array_aux[i],'href="','"');
					if (url_capitulo == '') continue;
					titulo = extraer_texto(array_aux[i] ,'class="color4">','</a>');
					
					//Obtener idiomas
					var array_flags= extraer_html_array(array_aux[i],'<img src','/>');
	
					for (var k=0;k< array_flags.length; k++)
					{
						var flag= extraer_texto(array_flags[k],'"','"').split('/');					
			
						if (flag[flag.length -1]=='es.png') titulo= titulo + " Español";
						if (flag[flag.length -1]=='la.png') titulo= titulo + " Latino";
						if (flag[flag.length -1]=='sub.png') titulo= titulo + " VOSE";
					}
										
					array_playlist.push(new Item_menu(titulo,imagen,params.page_uri,url_capitulo));
				}		
		return array_playlist;
		}
		
		
	}	
	//Propiedades y metodos Estaticos
	Seriesflv.categoria= function() {return 'series';}
	Seriesflv.getitem= function() {return new Item_menu('Seriesflv',"img/seriesflv.png",':vercanales:seriesflv');}

	CanalFactory.registrarCanal("seriesflv",Seriesflv); //Registrar la clase Seriesflv
	
	/************************************************************************************
	/* var Seriesdanko: Objeto que representa el canal Seriesdanko.com en Series		*
	/************************************************************************************/
	var Seriesdanko= function() {	
		var that=this; //Permite el acceso a metodos publicos desde metodos privados (closures): that.metodo_publico()
		var descripcion="";
		var imagen_actual="";
		
		//metodos publicos
		
		/************************************************************************
		/*	funcion getmenu: Devuelve un listado de las subsecciones del canal. *
		/*	Parametros: ninguno													*
		/*	Retorna: Array de objetos Item_menu									*
		/************************************************************************/
		this.getmenu= function(){
		//retorna el Menu
			var array_menu=[
				new Item_menu('Novedades','views/img/folder.png',':vercontenido:seriesdanko:novedades:'+ escape('http://seriesdanko.com//')),
				new Item_menu('Orden Alfabetico','views/img/folder.png',':alfabeto:seriesdanko:0'), 
				new Item_menu('Buscar Serie','views/img/search.png',':vercontenido:seriesdanko:tipobusqueda:'+ escape('http://seriesdanko.com/pag_search.php?q1=')) 
				];
		return array_menu;
		}
		
		/************************************************************************************
		/*	funcion getitem_alfabeto: Devuelve un listado de las subsecciones del canal. 	*
		/*	Parametros: ninguno																*
		/*	Retorna:Un objetos Item_menu													*
		/***********************************************************************************/
		this.getitem_alfabeto= function() {
			return (new Item_menu("SeriesDanko.com - Orden Alfabetico","views/img/folder.png",':vercontenido:seriesdanko:alfabeto:','http://seriesdanko.com/series.php?id='));
		}
			
		/************************************************************************************
		/*	funcion getplaylist: Devuelve un listado del contenido de las subsecciones.     *
		/*	Parametros: 																    *
		/*		page: referencia a la pagina de showtime desde donde se llama a la funcion. * 																*
		/*		tipo: especifica los diferentes tipos de listas soportados por el canal.    *
		/*		url: direccion de la que se debe extraer la lista.							*
		/*	Retorna: Array de objetos Item_menu											    *
		/************************************************************************************/
		this.getplaylist= function (page, tipo, url) {
			var array_playlist=[];
		
			var params={'url_servidor': unescape(url),
				'page_uri': ':vercontenido:seriesdanko:tiposerie:'}	

			switch (tipo)
			{
				case "novedades": //retorna el listado de las ultimas series actualizadas
					page.metadata.title ="SeriesDanko - Ultimos Capitulos";
					array_playlist=parseseriesdankoNew(params);
					break;
				case "alfabeto": //retorna el listado de las series que comienzan por una letra
					var letra=unescape(url).slice(-1).toUpperCase();
					if (letra=='0') letra= '0-9';
					page.metadata.title = "SeriesDanko - Orden Alfabetico: " + letra;
					params.url_servidor= unescape(url).slice(0,-1) + letra;
					array_playlist=parseseriesdankoBuscar(params);
					break;
				case "tipobusqueda": //retorna el listado de las series que contienen la palabra buscada
					//http://seriesdanko.com/pag_search.php?q1=		
					var texto_busqueda=that.cuadroBuscar();
					if(texto_busqueda!= undefined)
					{
						page.metadata.title = "SeriesDanko -Buscar - " + texto_busqueda;	
						params.url_servidor=escape(unescape(params.url_servidor) + texto_busqueda); 
						array_playlist= parseseriesdankoBuscar (params);
					}
					break;
				case "tiposerie": //retorna el listado de capitulos de una serie
					params.page_uri= ':verenlaces:seriesdanko:';
					array_playlist=parseseriesdankoGetCapitulos(params,page);
				break;
			}
		return array_playlist;
		}
		
		/****************************************************************************************
		/*	funcion getservidores: Devuelve un listado de enlaces a la pelicula en los 			*
		/*							servidores soportados. Sustituye a parseXXXXXpelicula (url)	*
		/*	Parametros: 																    	*
		/*		url: direccion de la que se debe extraer la lista.								*
		/*	Retorna: Array de servidores												    	*
		/****************************************************************************************/
		this.getservidores= function (url){
			var array_servidores=[];
			url=unescape(url);
	
			var file_contents = get_urlsource(url);
			var array_servidores=[];

			var titulo;
			var imagen= (!imagen_actual)?"views/img/nophoto.png":imagen_actual; //no hay imagenes en esta pagina
			var url_host;
			var servidor;
			var idioma;
			var calidad;
			
			
			if(file_contents!=false)
			{
				//item_Actual
				titulo = extraer_texto(file_contents ,"<h3 class='post-title entry-title'>",'</h3>');
				titulo= titulo.replace("\n","");
				titulo= titulo.replace(" ver online o descargar","");

				this.item_Actual=new Item_menu(titulo,imagen,null,url,descripcion);
				
				file_contents= extraer_texto(file_contents,"Opciones online (sin descarga)","Opciones de descarga");
				var array_aux = extraer_html_array(file_contents,'<img src=','Ver online');
				file_contents = "";
				
				var l=array_aux.length;

				for (var i=0;i<l;i++)
				{
					var idioma_aux= extraer_texto(array_aux[i] ,"'/","'").split('/');
					idioma=idioma_aux[idioma_aux.length-1];
					switch (idioma)
					{
					case "es.png":
						idioma="Español";
						break;
					case "vos.png":
						idioma="V.O.S.E";
						break;
					case "la.png":
						idioma="Latino";
						break;
					case "ca.png":
						idioma="Catalan";
						break;
					default:
						idioma="VO";
						break;			
					}
				
					url_host = "http://seriesdanko.com/" + extraer_texto(array_aux[i],"href='","'");
					servidor = extraer_texto(array_aux[i],"/servidores/","'").split(".");
		
					var params={
						"url_host" : url_host,
						"servidor" : servidor[0].toProperCase(),
						"idioma" : idioma,
						"calidad" : calidad
						};
	
					var objHost=HostFactory.createHost(servidor[0],params)
					if (objHost) array_servidores.push(objHost);		
				}
			}
		return array_servidores;
		}
		
		/************************************************************************
		/*	funcion gethost: Devuelve la url del host donde se aloja el video	*
		/*					 Sustituye a resolveXXXXXXpelicula(url)				*
		/*	Parametros:															*
		/*		url: direccion de la que se debe extraer la lista.				*
		/*	Retorna: String que representa la url								*
		/************************************************************************/
		this.geturl_host= function (url)
		{
			var file_contents = get_urlsource(url);
			var url_video= extraer_texto(file_contents ,'<meta http-equiv="refresh"','>');
			url_video= extraer_texto(url_video,'URL=','"');
			
			return url_video;		
		}
		
		
		//Metodos Privados
		function parseseriesdankoNew (params) 
		{	//retorna el listado de las ultimas series actualizadas
			var array_playlist=[];
			var file_contents = get_urlsource(params.url_servidor);
			
			file_contents = extraer_texto(file_contents,"<div class='post hentry'>","<div class='sidebar section' id='sidebar'>");	
			var array_aux = extraer_html_array(file_contents,"<h3 class='post-title entry-title'","<div class='post-header-line-1'>");
			file_contents = "";
			var l=array_aux.length;
			for (var i=0; i<l ;i++)
				{
					var titulo= extraer_texto(array_aux[i],">","</");
					var text_aux= extraer_texto(array_aux[i],"<div class='post-header'>","</div>");
					var url_serie= extraer_texto(text_aux,'href="','"');
				
					if (url_serie.startsWith("serie.php?")) 
					{
						url_serie= 'http://seriesdanko.com//' + url_serie;
						var imagen= extraer_texto(text_aux,"src='","'");
						array_playlist.push(new Item_menu(titulo,imagen,params.page_uri,url_serie));
					}			
				}
		return array_playlist;
		}
		
		function parseseriesdankoGetCapitulos (params,page) 
		{	//retorna el listado de capitulos de una serie
			var array_playlist=[];
			var imagen;
			
			var file_contents = get_urlsource(params.url_servidor);
						
			var titulo= extraer_texto(file_contents,"<h3 class='post-title entry-title'>","</h3>"); 
			titulo=titulo.replace("\n","");
			page.metadata.title = titulo;//Esto no funciona
				
			var array_temporadas = extraer_html_array(file_contents,"class='ict'","</span>");
			var h=array_temporadas.length;
			for (var i=0; i<h ;i++)
				{
					imagen = extraer_texto(array_temporadas[i],"src=","'");
					
					var array_capitulos = extraer_html_array(array_temporadas[i],"<a href","<Br>");
					var j=array_capitulos.length;
					for (var k=0; k<j ;k++)
						{
							var text_aux= extraer_texto(array_capitulos[k],"='","</a>").split(">");
							var url_capitulo= 'http://seriesdanko.com//' + text_aux[0].substr(0,text_aux[0].length-1);
							titulo= text_aux[1];
	
							//Obtener idiomas
							var array_flags= extraer_html_array(array_capitulos[k],'<img src=','/>');

							for (var l=0;l< array_flags.length; l++)
							{
								var flag= extraer_texto(array_flags[l],'/',' ').split('/');					
			
								if (flag[flag.length -1]=='es.png') titulo= titulo + " Español";
								if (flag[flag.length -1]=='la.png') titulo= titulo + " Latino";
								if (flag[flag.length -1]=='vos.png') titulo= titulo + " VOSE";
								if (flag[flag.length -1]=='vo.png') titulo= titulo + " VO";
								if (flag[flag.length -1]=='ca.png') titulo= titulo + " Catalan";
							}
														
							array_playlist.push(new Item_menu(titulo,imagen,params.page_uri,url_capitulo));
						}
				}
			imagen_actual=imagen;
		return array_playlist;
		}
		
		function parseseriesdankoBuscar (params) 
		{	
			var array_playlist=[];
			var file_contents = get_urlsource(unescape(params.url_servidor));
	
			file_contents = extraer_texto(file_contents,"<!-- Aquí comienza el rollo de la lista de Series -->","<div class='blog-pager' id='blog-pager'>");	
			file_contents = file_contents + "text-align:center;'>";
			var array_aux = extraer_html_array(file_contents,"<a href=","text-align:center;'>");
			file_contents = "";
			var l=array_aux.length;

			for (var i=0; i<l ;i++)
				{
					var url_serie= extraer_texto(array_aux[i],"'","'");
					if (url_serie.startsWith('../')) url_serie= url_serie.substr(3);
					url_serie= 'http://seriesdanko.com//' + url_serie;
					var titulo= extraer_texto(array_aux[i],"title='Capitulos de: ","'");
					var imagen= extraer_texto(array_aux[i],"src='","'");
					array_playlist.push(new Item_menu(titulo,imagen,params.page_uri,url_serie));			
				}
		return array_playlist;
		}
						
	}
	//Propiedades y metodos Estaticos
	//Seriesdanko.padre='ClasePadre';
	Seriesdanko.categoria= function() {return 'series';}
	Seriesdanko.getitem= function() {return new Item_menu('Seriesdanko',"img/seriesdanko.png",':vercanales:Seriesdanko');}

	CanalFactory.registrarCanal("Seriesdanko",Seriesdanko); //Registrar la clase Seriesdanko

	
	
	
//servidores de contenidos
//

//	
//Store
	/********************************************************************************
	/* var Store: Objeto que representa un objeto generico persistente en el disco 	*
	/*		duro y del que heredan el resto de objetos persistentes.				*
	/* 	Metodos Publicos:															*
	/*		addItem(), delItem(), iniStore(), getItems(), count()					*
	/*******************************************************************************/
	var Store= function(){
		//Propiedades
		this.store;

		//Metodos Publicos (algunos seran redefinidos por las clases herederas)
		/************************************************************************
		/*	funcion iniStore: Inicializa el Store.								*
		/*	Parametros: ninguno													*
		/*	Retorna: True si todo funciono bien, false en otro caso.			*
		/************************************************************************/
		this.iniStore= function() {	
			//Iniciamos las propiedades nuevas el objeto 
			this.store.lista="[]";
		return true;
		}


		/************************************************************************
		/*	funcion addItem: Añade un nuevo Item al Store.						*
		/*	Parametros: 														*
		/*		objItem: Item a añadir											*
		/*	Retorna: True si todo funciono bien, false en otro caso.			*
		/************************************************************************/
		this.addItem= function(objItem){
			objItem.fecha=(new Date()).getTime(); //Añadimos la fecha y hora actual al Item
			var array1 = [objItem];
			var list = eval(this.store.lista);
			var array = (array1.length>0)?array1.concat(list):array1;
			this.store.lista = showtime.JSONEncode(array);

			return true;
		}

		/************************************************************************
		/*	funcion delItem: Elimina un Item del Store.							*
		/*	Parametros: 														*
		/*		objItem: Item a eliminar (ha de incluir: fecha,titulo y url)	*
		/*	Retorna: True si todo funciono bien, false en otro caso.			*
		/************************************************************************/
		this.delItem= function(objItem){
			var list = eval(this.store.lista);
			for (var i=0;i<list.length;i++){
				//comparar los Item del store con el objItem
				if (list[i].fecha == objItem.fecha && list[i].url == objItem.url)
				{
					//Borrar del array el item encontrado
					list.splice(i,1);
					if	(list.length==0)	{this.store.lista ="[]";}
					else					{this.store.lista = showtime.JSONEncode(list);}				
					return true;
				}
			}		
		return false;
		}

		/************************************************************************
		/*	funcion getItems: Recupera todos los items almacenados en el Store	*
		/*	Parametros: ninguno													*
		/*	Retorna: un Array con los Items almacenados en el Store				*
		/************************************************************************/
		this.getItems= function(){
			return	eval(this.store.lista);
		}

		/************************************************************************
		/*	funcion count: Retorna el numero de Items almacenados en el Store	*
		/*	Parametros: ninguno													*
		/*	Retorna: Numero de Items almacenados en el Store					*
		/************************************************************************/
		this.count= function() {
			if (typeof this.store.lista === 'undefined') this.iniStore();
			var list = eval(this.store.lista);
			return list.length;
		}		
	}

	/********************************************************************************	
	/* var StoreFavoritos: Objeto que representa el Store Favotiros					*
	/*		Hereda de Store															*
	/*******************************************************************************/
	var StoreFavoritos= function() {
		this.store=plugin.createStore('store/favoritos',true);
	}
	StoreFavoritos.prototype=new Store(); // <<-- Herencia por prototype

	/********************************************************************************	
	/* var StoreHistorial: Objeto que representa el Store Historial					*
	/*		Hereda de Store															*
	/*******************************************************************************/
	var StoreHistorial= function() {
		this.store=plugin.createStore('store/historial',true);


		/********************************************************************************
		/*	funcion getItems: Recupera todos los items almacenados en el StoreHistorial	*
		/*	Parametros: 																*
		/*		periodo (hoy, ayer, ultima semana, ultimo mes o resto): Representa un 	*
		/*				periodo de tiempo determinado.									*
		/*	Retorna: un Array con los Items almacenados en el periodo indicado.			*
		/*******************************************************************************/
		this.getItems= function(periodo){
			var ahora=new Date();
			var fechaHoy=new Date(ahora.getFullYear(),ahora.getMonth(),ahora.getDate()); //fecha de hoy
			var fechaMax,fechaMin; //en milisegundos

			switch (periodo.toLowerCase().replace(/\s+|\.+/g,''))
				{
				case 'hoy':
					fechaMax=ahora.getTime(); // ahora
					fechaMin=fechaHoy.getTime(); //hoy
					break;
				case 'ayer':	
					fechaMax=fechaHoy.getTime(); //hoy
					fechaMin=fechaHoy.setDate(fechaHoy.getDate() - 1 ); //ayer
					break;
				case 'estasemana': 
					fechaMax=ahora.getTime(); // ahora
					if (fechaHoy.getDay() == 0) //Si hoy es domingo
					{
						fechaMin=fechaHoy.setDate(fechaHoy.getDate() -6 ); //El lunes
					}else{
						fechaMin=fechaHoy.setDate(fechaHoy.getDate() -fechaHoy.getDay()+1 ); //El lunes
					}	
					break;
				case 'estemes': 
					fechaMax=ahora.getTime(); // ahora
					fechaMin= fechaHoy.setDate(1);//El dia 1 del mes en curso
					break;
				default:		
					fechaMax= fechaHoy.setDate(1);//El dia 1 del mes en curso
					fechaMin= (new Date(2014,0,1)).getTime(); //fijamos como fecha inicial 1/1/2014
				}

			var list = eval(this.store.lista);
			var array=[];
			for (var i=0;i<list.length;i++){
				if (list[i].fecha > fechaMin && list[i].fecha < fechaMax)
					array.push(list[i]);		
			}
		return	array;
		}


		/********************************************************************************************
		/*	funcion existe: Comprueba si la url pasada como parametro existe en el StoreHistorial	*
		/*	Parametros: 																			*
		/*		item_url: direccion url a buscar en el StoreHistorial								*
		/*	Retorna: Un numero entero que representa la fecha mas reciente en la que se guardo		*
		/*		el item en el StoreHistorial o undefined si no existe								*
		/*******************************************************************************************/
		this.existe= function(item_url){
			var list = eval(this.store.lista);
			var array=[];
			for (var i=0;i<list.length;i++){
				if (list[i].url == item_url)
					array.push(list[i].fecha);		
			}
			array.sort(function (a, b){return b-a;});	//nos aseguramos q estan ordenados numericamente en orden inverso	
		return array[0];
		}


		/****************************************************************************************
		/*	funcion addItem: Añade un nuevo Item al StoreHistorial, solo en el caso de que no	*
		/*		se haya añadido ya hoy el mismo item. 											*
		/*	Parametros: 																		*
		/*		objItem: Item a añadir															*
		/*	Retorna: True si todo funciono bien, false en otro caso.							*
		/***************************************************************************************/
		this.addItem= function(objItem){
			var fecha= this.existe(objItem.url)
			var ahora=new Date();
			var fechaHoy=new Date(ahora.getFullYear(),ahora.getMonth(),ahora.getDate());

			if ((fecha == undefined) || (fecha < fechaHoy))
			{
				objItem.fecha= ahora.getTime(); //Añadimos la fecha y hora actual al Item
				var array1 = [objItem];
				var list = eval(this.store.lista);
				var array = (array1.length>0)?array1.concat(list):array1;
				this.store.lista = showtime.JSONEncode(array);

				return true;
			}
		return false;
		}


		/************************************************************************
		/*	funcion iniStore: Inicializa el StoreHistorial.						*
		/*	Parametros: ninguno													*
		/*	Retorna: True si todo funciono bien, false en otro caso.			*
		/************************************************************************/
		this.iniStore= function() {	
			//Eliminamos propiedades antiguas del objeto si existen
			if (this.store.ayer != undefined) delete this.store.ayer;
			if (this.store.ultimasemana != undefined) delete this.store.ultimasemana;
			if (this.store.hoy != undefined) delete this.store.hoy;
			if (this.store.ultimomes != undefined) delete this.store.ultimomes;
			if (this.store.resto != undefined) delete this.store.resto;

			//Iniciamos las propiedades nuevas el objeto 
			this.store.lista="[]";
		return true;
		}

	}
	StoreHistorial.prototype= new Store(); // <<-- Herencia por prototype	
//Store
//




//////////////////////////////////////////////////////////////////////////
//																		//
// 		Extender tipos primitivos										//
//																		//
//////////////////////////////////////////////////////////////////////////	

	 //Añadir funciones al prototipo de Date
	if (typeof Date.prototype.formatSp != 'function') {
		Date.prototype.formatSp = function (){
			//Retorna un String con la fecha en formato DD/MM/YYYY HH:MM
			var dia= this.getDate()>9?this.getDate():"0"+this.getDate();
			var mes= (this.getMonth()+1)>9?(this.getMonth()+1):"0"+(this.getMonth()+1);
			var hora= this.getHours()>9?this.getHours():"0"+this.getHours();
			var minutos=this.getMinutes()>9?this.getMinutes():"0"+this.getMinutes();

			return  dia + '/' + mes + '/' + this.getFullYear() + ' ' + hora +':' + minutos;};
	}


    //Añadir funciones al prototipo String
	if (typeof String.prototype.startsWith != 'function') {
		String.prototype.startsWith = function (str){
			return this.slice(0, str.length) == str;};
		}
    if (typeof String.prototype.endsWith != 'function') {
		String.prototype.endsWith = function (str){
			return this.slice(-str.length) == str;};
		}
	if (typeof String.prototype.trim != 'function') {
		String.prototype.trim = function (str){
			return this.replace(/^\s+|\s+$/g, '');};
		}
	if (typeof String.prototype.toProperCase != 'function') {
		String.prototype.toProperCase = function (){
			return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});};
		}


	//Añadir funciones al prototipo de Array
	if (typeof Array.prototype.uniqueObjects!= 'function') {
		Array.prototype.uniqueObjects = function (props) {
		//Elimina elementos duplicados de un Array de objetos utilizando un array de campos como comparador
		/*Ejem: ArrayPersonas.uniqueObjects(["Nombre"]);
		*		ArrayPersonas.uniqueObjects(["Apellidos" , "Nombre"]);
		*/
		//Vease: //http://jsbin.com/ahijex/4/edit
			function compare(a, b) {
				var prop;
				if (props) {
					for (var j = 0; j < props.length; j++) {
						prop = props[j];

						if (a[prop] != b[prop]) return false;
					}
				}else {
					for (prop in a) {
						if (a[prop] != b[prop]) return false;
					}
				}
				return true;
			}
			return this.filter(function (item, index, list) {
				for (var i = 0; i < index; i++) {
					if (compare(item, list[i])) return false;
				}
			return true;
			});
		};
	}
	if (typeof Array.prototype.sortBy!= 'function') {
		//Ordena los elementos de un Array de objetos en funcion de uno o varios campos
		/*Ejem: ArrayPersonas.sortBy("Nombre");
		*		ArrayPersonas.sortBy("Apellidos" , "Nombre");
		*		ArrayPersonas.sortBy("-Edad"); <-- Orden inverso
		*/
		//Vease: http://jsfiddle.net/M2ESb/
		!function() {
			function _dynamicSortMultiple(attr) {
				var props = arguments;
				return function (obj1, obj2) {
					var i = 0, result = 0, numberOfProperties = props.length;
						/* try getting a different result from 0 (equal)
							as long as we have extra properties to compare*/
					while(result === 0 && i < numberOfProperties) {
						result = dynamicSort(props[i])(obj1, obj2);
						i++;}
					return result;
				}
			}

			function dynamicSort(property) {
				var sortOrder = 1;
				if(property[0] === "-") {
					sortOrder = -1;
					property = property.substr(1);}
				return function (a,b) {
					var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
					return result * sortOrder;
				}
			}

			Array.prototype.sortBy = function() {
				return this.sort(_dynamicSortMultiple.apply(null, arguments));
			}
		}();
	}    
    

//////////////////////////////////////////////////////////////////////////
//																		//
// 		Funciones genericas												//
//																		//
//////////////////////////////////////////////////////////////////////////		


	function get_urlheaders(url_servidor) {
		//'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:15.0) Gecko/20100101 Firefox/15.0.1'
		//				'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux i686; rv:26.0) Gecko/20100101 Firefox/26.0'
		var codigo_html = showtime.httpReq(url_servidor, 
			{
			debug: false,
			compression: true,
			noFollow: true,
			headRequest: true,
			headers: 
				{
				'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:27.0) Gecko/20100101 Firefox/27.0'
  				}
			});

		return codigo_html;
		}

	function get_urlsource(url_servidor) {
		//'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:15.0) Gecko/20100101 Firefox/15.0.1'
		//				'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux i686; rv:26.0) Gecko/20100101 Firefox/26.0'
		var codigo_html = showtime.httpReq(url_servidor, 
				{
				debug: false,
				compression: false,
				headers: 
					{
					'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:27.0) Gecko/20100101 Firefox/27.0'
					}
				}).toString();
				
		return codigo_html;
		}

	function get_urlsourcereferer(url_servidor, referer) {
		//'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:15.0) Gecko/20100101 Firefox/15.0.1'
		//				'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux i686; rv:26.0) Gecko/20100101 Firefox/26.0'
		var codigo_html = showtime.httpReq(url_servidor, 
			{
			debug: false,
			compression: true,
			headers: 
				{
				'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:27.0) Gecko/20100101 Firefox/27.0',
				'Referer': referer
  				}
			}).toString();

		return codigo_html;
		}

	function post_urlsource(url_servidor, datos_post){
		//'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:15.0) Gecko/20100101 Firefox/15.0.1'
		//				'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:27.0) Gecko/20100101 Firefox/27.0'
		//JSONEncode 

		var codigo_html = showtime.httpReq(url_servidor, 
			{
			debug: false,
			compression: true,
			method: 'POST',
			postdata: datos_post,
			headers: 
				{
				'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:27.0) Gecko/20100101 Firefox/27.0'
  				}
			}).toString();

		return codigo_html;
		}

	function extraer_texto(texto,cadena_inicial,cadena_final) {
		//Extrae el texto de una cadena pasando una cadena inicial y otra final
		//Si no existe la cadena inicial o la cadena final dentro del texto retorna un texto vacio
		var pos_ini;
		var pos_final;


		pos_ini = texto.indexOf(cadena_inicial);
		if (pos_ini==-1) return '';
		texto = texto.substr(pos_ini+cadena_inicial.length);
		pos_final = texto.indexOf(cadena_final);
		if (pos_final==-1) return '';
		texto = texto.substr(0,pos_final);
		return texto;
    }

    function extraer_html_array(texto_html,cadena_inicial,cadena_final) {
		//Estrae el texto de manera repetitiva pasando cadena inicial, y final, y lo saca en un array
		var pos_ini;
		var pos_final;

		var array_aux=[];
		var aux_string;

		pos_ini = texto_html.indexOf(cadena_inicial);
		while (pos_ini!=-1)
			{
			texto_html = texto_html.substr(pos_ini);
			pos_final = texto_html.indexOf(cadena_final);
			aux_string = texto_html.substr(0,pos_final+cadena_final.length);
			array_aux.push(aux_string);
			texto_html= texto_html.substr(pos_final);
			pos_ini = texto_html.indexOf(cadena_inicial);
			}
		return array_aux;
    }

	function utf8_decode(str_data) {
		//  discuss at: http://phpjs.org/functions/utf8_decode/
		// original by: Webtoolkit.info (http://www.webtoolkit.info/)
		//    input by: Aman Gupta
		//    input by: Brett Zamir (http://brett-zamir.me)
		// improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
		// improved by: Norman "zEh" Fuchs
		// bugfixed by: hitwork
		// bugfixed by: Onno Marsman
		// bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
		// bugfixed by: kirilloid
		//   example 1: utf8_decode('Kevin van Zonneveld');
		//   returns 1: 'Kevin van Zonneveld'

		var tmp_arr = [],
		i = 0,
		ac = 0,
		c1 = 0,
		c2 = 0,
		c3 = 0,
		c4 = 0;

		str_data += '';

		while (i < str_data.length) {
			c1 = str_data.charCodeAt(i);
			if (c1 <= 191) {
				tmp_arr[ac++] = String.fromCharCode(c1);
				i++;
			}
			else if (c1 <= 223) {
				c2 = str_data.charCodeAt(i + 1);
				tmp_arr[ac++] = String.fromCharCode(((c1 & 31) << 6) | (c2 & 63));
				i += 2;
			} 
			else if (c1 <= 239) {
			// http://en.wikipedia.org/wiki/UTF-8#Codepage_layout
			c2 = str_data.charCodeAt(i + 1);
			c3 = str_data.charCodeAt(i + 2);
			tmp_arr[ac++] = String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
			i += 3;
			}
			else {
				c2 = str_data.charCodeAt(i + 1);
				c3 = str_data.charCodeAt(i + 2);
				c4 = str_data.charCodeAt(i + 3);
				c1 = ((c1 & 7) << 18) | ((c2 & 63) << 12) | ((c3 & 63) << 6) | (c4 & 63);
				c1 -= 0x10000;
				tmp_arr[ac++] = String.fromCharCode(0xD800 | ((c1 >> 10) & 0x3FF));
				tmp_arr[ac++] = String.fromCharCode(0xDC00 | (c1 & 0x3FF));
				i += 4;
			}
		}
		return tmp_arr.join('');
	}

function utf8_encode(argString) {
  //  discuss at: http://phpjs.org/functions/utf8_encode/
  // original by: Webtoolkit.info (http://www.webtoolkit.info/)
  // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // improved by: sowberry
  // improved by: Jack
  // improved by: Yves Sucaet
  // improved by: kirilloid
  // bugfixed by: Onno Marsman
  // bugfixed by: Onno Marsman
  // bugfixed by: Ulrich
  // bugfixed by: Rafal Kukawski
  // bugfixed by: kirilloid
  //   example 1: utf8_encode('Kevin van Zonneveld');
  //   returns 1: 'Kevin van Zonneveld'

  if (argString === null || typeof argString === 'undefined') {
    return '';
  }

  var string = (argString + ''); // .replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  var utftext = '',
    start, end, stringl = 0;

  start = end = 0;
  stringl = string.length;
  for (var n = 0; n < stringl; n++) {
    var c1 = string.charCodeAt(n);
    var enc = null;

    if (c1 < 128) {
      end++;
    } else if (c1 > 127 && c1 < 2048) {
      enc = String.fromCharCode(
        (c1 >> 6) | 192, (c1 & 63) | 128
      );
    } else if ((c1 & 0xF800) != 0xD800) {
      enc = String.fromCharCode(
        (c1 >> 12) | 224, ((c1 >> 6) & 63) | 128, (c1 & 63) | 128
      );
    } else { // surrogate pairs
      if ((c1 & 0xFC00) != 0xD800) {
        throw new RangeError('Unmatched trail surrogate at ' + n);
      }
      var c2 = string.charCodeAt(++n);
      if ((c2 & 0xFC00) != 0xDC00) {
        throw new RangeError('Unmatched lead surrogate at ' + (n - 1));
      }
      c1 = ((c1 & 0x3FF) << 10) + (c2 & 0x3FF) + 0x10000;
      enc = String.fromCharCode(
        (c1 >> 18) | 240, ((c1 >> 12) & 63) | 128, ((c1 >> 6) & 63) | 128, (c1 & 63) | 128
      );
    }
    if (enc !== null) {
      if (end > start) {
        utftext += string.slice(start, end);
      }
      utftext += enc;
      start = end = n + 1;
    }
  }

  if (end > start) {
    utftext += string.slice(start, stringl);
  }

  return utftext;
}



//////////////////////////////////////////////////////////////////////////
//																		//
// 		Main															//
//																		//
//////////////////////////////////////////////////////////////////////////	

	var PREFIX = "peli-xr";

	var parental_mode = true;
	var licencia = '';
	var licencia_md5 = '1e7c1eac9e131fe3a01d7594c071bf8c'; //not4kids

	var canal_test=false; //for testing only

	var objCanal;
	var objHistorial=new StoreHistorial();
	var objFavoritos=new StoreFavoritos();


	//
	//Settings
	var service = plugin.createService("Peli-XR", "peli-xr:start", "video", true, plugin.path + "logo.png");
	var settings = plugin.createSettings("Peli-XR", plugin.path + "logo.png", "Peli-XR: Navegador web de Contenidos");

	settings.createInfo("info", plugin.path + "logo.png", "Peli-XR creado por Rankstar.\n\n	Navegador web que soporta distintos sitios web con contenido multimedia\n\n Ahora gracias a SuperBerny soporta contenido de livestreams");

	//Datos personales y privacidad
	settings.createDivider('Datos personales y privacidad');
	if(parental_mode == false)
		{
		var opciones_historial = [ 	['todo', 'Todo', true], ['sinadultos', 'Casi Todo'], ['no', 'No'] ];
		}
	else
		{
		var opciones_historial = [ 	['sinadultos', 'Si', true], ['no', 'No'] 	];
		}

    settings.createMultiOpt("historyTracking", "Guardar historial", opciones_historial, function(v){
        service.historyTracking = v;
    });


	function borrarHistorial() {
		if (objHistorial) {
			objHistorial.iniStore();
			showtime.notify('El Historial ha sido borrado', 3);
		}
	}	
	settings.createAction("cleanLocalHistoryPlaylist", "Borrar historial", borrarHistorial);

	function borrarFavoritos () {
		if (objFavoritos) {
			objFavoritos.iniStore();
			showtime.notify('Los Favoritos han sido borrados', 3);
		}

	}
	settings.createAction("cleanLocalFavoritesPlaylist", "Borar favoritos",borrarFavoritos);

	settings.createAction("cleanLocalPlaylists", "Borrar todo", function () {
		borrarHistorial();
		borrarFavoritos();
	});

	settings.createDivider('Opciones');
	settings.createString("urlxml_liveStream", "Añadir lista de canales LiveStream (xml)", "", function(v) { service.urlxml_liveStream = v; });

	if(parental_mode == false)
		{
		//Opciones
		settings.createBool("modoadultos", "Mostrar canales de adultos", false, function (v) { service.modoadultos = v; });
		// Fin de opciones
		}
	else
		{
		settings.createDivider('Numero de licencia');
		settings['licencia'] = '';
		settings.createString("licencia", "Nº Licencia", '', function(v) { licencia = v; });
		}

	//Settings	
	//	

	//
	//startPage
	function startPage(page) {
		page.metadata.background = plugin.path + "views/img/background.png";

		//Terminos
		if (!settings['terminos'])
			{
			var terminos_txt = 'Este plugin es un navegador web tal y como pueden ser internet explorer, mozilla firefox, google chrome, opera,... para diferentes sitios web con contenido multimedia';
			if(showtime.message(terminos_txt, true, true)==true)
				{
				settings['terminos'] = 1;
				}
			else
				{
				page.error("Si no estas de acuerdo, desinstala este plugin.");
				return;
				}
			}


		//Crear los objetos del Menu Principal
		var menu_principal =[
			new Item_menu('Peliculas',"img/peliculas.png"),
			new Item_menu('Series',"img/series.png"),
			new Item_menu('Anime',"img/anime.png"),
			new Item_menu('TV online',"img/tvonline.png")];

		//Items opcionales
			//Item_menu Adultos
				if(parental_mode == false)
				{
					if (service.modoadultos == true)
						menu_principal.push(new Item_menu('Adultos',"img/adultos.png"));
				}
				else
				{
					if(showtime.md5digest(licencia) == licencia_md5) 
						menu_principal.push(new Item_menu('Adultos',"img/adultos.png"));		
				}
			//Item_menu Test
				if (canal_test == true)
					menu_principal.push( new Item_menu('Test',"img/test.png"));				
			//Item_menu Favoritos
				if(objFavoritos.count()>0)
					menu_principal.push(new Item_menu('Favoritos',"views/img/bookmark.png"));			
			//Item_menu Historial
				if(objHistorial.count()>0)
					menu_principal.push(new Item_menu('Historial',"views/img/history.png","historial:main"));	

		//Añadimos los objetos al Menu Principal
		for (var i=0; i< menu_principal.length;i++) 
		{
			page.appendItem(menu_principal[i].page_uri,"directory",{
				title:menu_principal[i].titulo,
				titlecover : menu_principal[i].titulo,
				icon: menu_principal[i].imagen});

		}

		page.metadata.glwview = plugin.path + "views/array3.view";
		page.type = "directory";
		page.contents = "items";
		page.loading = false;
	}
	//startPage
	//


	//Pagina Peliculas
	plugin.addURI(PREFIX + ":peliculas", function(page) {
		page.metadata.background = plugin.path + "views/img/background.png";

		var menu_peliculas=CanalFactory.getListadoCanales('peliculas');

		//Añadimos los objetos al menu Peliculas
		for (var i=0; i< menu_peliculas.length;i++) 
		{
			page.appendItem(menu_peliculas[i].page_uri,"directory",{
				title:menu_peliculas[i].titulo,
				titlecover : menu_peliculas[i].titulo,
				icon: menu_peliculas[i].imagen});	
		}	

		page.metadata.glwview = plugin.path + "views/array3.view";
		page.type = "directory";
		page.contents = "items";
		page.loading = false;
	});
	//Pagina Peliculas


	//Pagina Series
	plugin.addURI(PREFIX + ":series", function(page) {
		page.metadata.background = plugin.path + "views/img/background.png";

		var menu_series=CanalFactory.getListadoCanales('series');

		//Añadimos los objetos al menu Series
		for (var i=0; i< menu_series.length;i++) 
		{
			page.appendItem(menu_series[i].page_uri,"directory",{
				title:menu_series[i].titulo,
				titlecover : menu_series[i].titulo,
				icon: menu_series[i].imagen});	
		}		

		page.metadata.glwview = plugin.path + "views/array3.view";
		page.type = "directory";
		page.contents = "items";
		page.loading = false;
	});
	//Pagina Series


	//Pagina Anime
	plugin.addURI(PREFIX + ":anime", function(page) {
		page.metadata.background = plugin.path + "views/img/background.png";

		var menu_anime=CanalFactory.getListadoCanales('anime');

		//Añadimos los objetos al menu Anime
		for (var i=0; i< menu_anime.length;i++) 
		{
			page.appendItem(menu_anime[i].page_uri,"directory",{
				title:menu_anime[i].titulo,
				titlecover : menu_anime[i].titulo,
				icon: menu_anime[i].imagen});	
		}	

		page.metadata.glwview = plugin.path + "views/array3.view";
		page.type = "directory";
		page.contents = "items";
		page.loading = false;
	});
	//Pagina Anime


	//Pagina TVonline
	plugin.addURI(PREFIX + ":tvonline", function(page) {
		page.metadata.background = plugin.path + "views/img/background.png";

		var menu_tvonline=CanalFactory.getListadoCanales('tvonline');

		//Añadimos los objetos al menu TV Online
		for (var i=0; i< menu_tvonline.length;i++) 
		{
			page.appendItem(menu_tvonline[i].page_uri,"directory",{
				title:menu_tvonline[i].titulo,
				titlecover : menu_tvonline[i].titulo,
				icon: menu_tvonline[i].imagen});	
		}	

		page.metadata.glwview = plugin.path + "views/array3.view";
		page.type = "directory";
		page.contents = "items";
		page.loading = false;
	});
	//Pagina TVonline


	//Pagina Adultos
	plugin.addURI(PREFIX + ":adultos", function(page) {
		page.metadata.background = plugin.path + "views/img/background.png";

		var menu_adultos=CanalFactory.getListadoCanales('adultos');

		//Añadimos los objetos al menu Adultos
		for (var i=0; i< menu_adultos.length;i++) 
		{
			page.appendItem(menu_adultos[i].page_uri,"directory",{
				title:menu_adultos[i].titulo,
				titlecover : menu_adultos[i].titulo,
				icon: menu_adultos[i].imagen});	
		}	

		page.metadata.glwview = plugin.path + "views/array3.view";
		page.type = "directory";
		page.contents = "items";
		page.loading = false;
	});
	//Pagina Adultos


	//Pagina Historial
	plugin.addURI(PREFIX + ":historial:(.*)", function(page, periodo) {
		page.metadata.background = plugin.path + "views/img/background.png";

		var item;
		if(periodo=="main")
			{
			page.metadata.title = 'Historial';
			var menu_categorias=[
				new Item_menu('Hoy',"views/img/folder.png",':historial:Hoy'),
				new Item_menu('Ayer',"views/img/folder.png",':historial:Ayer'),
				new Item_menu('Esta Semana',"views/img/folder.png",':historial:Esta Semana'),
				new Item_menu('Este Mes',"views/img/folder.png",':historial:Este Mes'),
				new Item_menu('Anteriores',"views/img/folder.png",':historial:Meses Anteriores')];

			for(var i=0; i<menu_categorias.length;i++)
				{
				page.appendItem(menu_categorias[i].page_uri, "directory", {
					title: new showtime.RichText(menu_categorias[i].titulo),
					titlecover : new showtime.RichText(menu_categorias[i].titulo),
					icon: menu_categorias[i].imagen});
				}
			page.metadata.glwview = plugin.path + "views/array3.view";
			}
		else
			{
			page.metadata.title = 'Historial - ' + periodo; 

			var lista =objHistorial.getItems(periodo)
			for (i=0;i<lista.length;i++)
				{
				item = page.appendItem(PREFIX + ':vervideo:' + lista[i].canal + ':' + lista[i].host + ':' + escape(lista[i].titulo) + ':' + escape(lista[i].imagen) + ':' + escape(lista[i].url), "directory", {
					title: new showtime.RichText(lista[i].titulo + ' <font color=\"5AD1B5\">[' + (lista[i].host).toProperCase() + ']</font>'),
					titlecover : new showtime.RichText('<font color="#ffffff" size="3">' + (lista[i].titulo).substring(0,9) + '</font>' ),
					infotag : new showtime.RichText((new Date(lista[i].fecha)).formatSp()),
					icon: lista[i].imagen});

				item.fecha = lista[i].fecha;
				item.titulo = lista[i].titulo;
				item.url = lista[i].url;

				item.addOptSeparator("Peli-XR");
				item.addOptAction("Borrar del historial", "borraritemhistorial");
				item.onEvent('borraritemhistorial', function (item)
					{
					if (objHistorial.delItem({
							'fecha': this.fecha,
							'titulo':this.titulo,
							'url': this.url})){
								showtime.notify(this.titulo + ' borrado de historial',3);
								if (lista.length > 1){
									page.redirect(PREFIX + ':historial:' + periodo);
								}else{
									page.redirect(PREFIX + ':historial:main');
								}


							}
					});

				}
			}

		page.metadata.glwview = plugin.path + "views/array3.view";
		page.type = "directory";
		page.contents = "items";
		page.loading = false;
	});
	//Pagina Historial


	//Pagina Favoritos
	plugin.addURI(PREFIX + ":favoritos", function(page) {
		page.metadata.background = plugin.path + "views/img/background.png";

		var lista = objFavoritos.getItems();

		var item={};
		for (var i=0;i<lista.length;i++)
			{
			var uri;
			var f_titulo;

			uri = lista[i].uri;
			f_titulo= new showtime.RichText(lista[i].titulo + ' <font color=\"5AD1B5\">[' + (lista[i].host).toProperCase() + ']</font>');
			item = page.appendItem(uri, "directory", {
				title: f_titulo,
				titlecover : new showtime.RichText('<font color="#ffffff" size="3">' + lista[i].titulo.substring(0,9) + '</font>'),
				icon: lista[i].imagen});

			item.fecha = lista[i].fecha;
			item.titulo = lista[i].titulo;
			item.url_video = lista[i].url;

			item.addOptSeparator("Peli-XR");
			item.addOptAction("Borrar de favoritos", "borraritemfavoritos");
			item.onEvent('borraritemfavoritos', function (item)
				{			
				if (objFavoritos.delItem({
							'fecha': this.fecha,
							'titulo':this.titulo,
							'uri': this.uri})){	
								showtime.notify(this.titulo + ' borrado de favoritos',3);
								if (objFavoritos.count()>0){
									page.redirect(PREFIX + ':favoritos');
								}else{
									page.redirect(PREFIX + ':start');}
							}
				});
			}

		page.metadata.glwview = plugin.path + "views/array3.view";
		page.type = "directory";
		page.contents = "items";
		page.loading = false;
	});
	//Pagina Favoritos


	//Pagina Alfabeto
	plugin.addURI(PREFIX + ":alfabeto:(.*):(.*)", function(page,servidor,caracter_numerico) {
		page.metadata.background = plugin.path + "views/img/background.png";

		var item=objCanal.getitem_alfabeto();

		var array_alfabeto=['0-9',"A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];

		page.appendItem(item.page_uri + escape(item.url + caracter_numerico), "directory", {
				title: array_alfabeto[0],
				icon: plugin.path + "views/img/folder.png"});

		for (var i=1;i<array_alfabeto.length;i++)
			{
			page.appendItem(item.page_uri + escape(item.url + array_alfabeto[i].toLowerCase()), "directory", {
				title: array_alfabeto[i],
				icon: plugin.path + "views/img/folder.png"});
			}

		page.metadata.title = item.titulo;
		page.metadata.glwview = plugin.path + "views/list3.view";
		page.type = "directory";
		page.contents = "items";
		page.loading = false;
	});			
	//Pagina Alfabeto


	//Pagina ver canales
	plugin.addURI(PREFIX + ":vercanales:(.*)", function(page,canal) {
		page.metadata.background = plugin.path + "views/img/background.png";

		var array_menu=[];

		objCanal=CanalFactory.createCanal(canal); 

		array_menu= objCanal.getmenu();

		for (var i=0;i<array_menu.length;i++)
			{
			page.appendItem(array_menu[i].page_uri, "directory", {
				titlecover : new showtime.RichText(array_menu[i].titulo),
				//Si el titulo tiene varias linea "\n" se convierte en una sola, 
				//esto es un truco para añadir texto que no cabria en titlecover.
				title: new showtime.RichText(array_menu[i].titulo.replace(/\n/g,'')), 
				icon: array_menu[i].imagen});
			}

		page.metadata.glwview = plugin.path + "views/array3.view";
		page.type = "directory";
		page.contents = "items";
		page.loading = false;
	});		
	//Pagina ver canales


	//Listado de items generico
	plugin.addURI(PREFIX + ":vercontenido:(.*):(.*):(.*)", function(page, canal, tipo, url) {
		page.metadata.background = plugin.path + "views/img/background.png";

		var array_playlist=[];

		if (objCanal == undefined) {objCanal=CanalFactory.createCanal(canal);}
			else {if (objCanal.name != canal) objCanal=CanalFactory.createCanal(canal);}

		array_playlist=objCanal.getplaylist(page, tipo, url);

		//pintar el vercontenido se recorre el array y se pinta
		var item;
		for (var i=0;i<array_playlist.length;i++)
			{
			item = page.appendItem(array_playlist[i].page_uri + escape(array_playlist[i].url), "directory", {
				title: new showtime.RichText(array_playlist[i].titulo),
				icon: array_playlist[i].imagen});

			item.uri = array_playlist[i].page_uri + escape(array_playlist[i].url);
			item.titulo = array_playlist[i].titulo;
			item.imagen = array_playlist[i].imagen;
			item.host = objCanal.name;
			item.addOptSeparator("Peli-XR");
			item.addOptAction("Agregar a Favoritos", "agregarafavoritos");

			item.onEvent('agregarafavoritos', function (item)	
				{ //Añadir pagina de enlaces

					if (objFavoritos.addItem({
							'titulo':this.titulo,
							'imagen':this.imagen,
							'uri': this.uri,
							'host':this.host}))	
								showtime.notify(this.titulo + ' agregado a favoritos',3);	
				});


			}

		page.metadata.glwview = plugin.path + "views/list3.view";
		page.type = "directory";
		page.contents = "items";
		page.loading = false;
	});		
	//Listado de items generico


	//Listado del mismo item x todo los servers disponibles
	plugin.addURI(PREFIX + ":verenlaces:(.*):(.*)", function(page, canal, url) {
		page.metadata.background = plugin.path + "views/img/background.png";

		var array_servidores=[];
		var tipo_video;

		if (objCanal == undefined) {objCanal=CanalFactory.createCanal(canal);}
			else {if (objCanal.name != canal) objCanal=CanalFactory.createCanal(canal);}


		array_servidores=objCanal.getservidores(url);

		//pintar el playlist se recorre el array y se pinta
		if (array_servidores.length == 0)
		{
		showtime.notify('No se han encontrado servidores soportados',3)
		}else{
			var item;
			for (var i=0;i<array_servidores.length;i++)
				{				
				item = page.appendItem(PREFIX + ':vervideo:'+ canal + ':' + array_servidores[i].servidor + ':' + escape(objCanal.item_Actual.titulo) + ':' + escape(objCanal.item_Actual.imagen) + ':' + escape(array_servidores[i].url_video), "video", {
					title: new showtime.RichText(array_servidores[i].titulo),
					servidor: new showtime.RichText(array_servidores[i].servidor),
					idioma: array_servidores[i].idioma,
					calidad: array_servidores[i].calidad
					});

				item.uri = PREFIX + ':vervideo:'+ canal + ':' + array_servidores[i].servidor + ':' + escape(objCanal.item_Actual.titulo) + ':' + escape(objCanal.item_Actual.imagen) + ':' + escape(array_servidores[i].url_video);
				item.host = array_servidores[i].servidor;
				item.addOptSeparator("Peli-XR");
				item.addOptAction("Agregar a Favoritos", "agregarafavoritos");

				item.onEvent('agregarafavoritos', function (item)
					{ //Añadir enlace del video						
						if (objFavoritos.addItem({
							'titulo':objCanal.item_Actual.titulo,
							'imagen':objCanal.item_Actual.imagen,
							'uri': this.uri,
							'host':this.host}))	
								showtime.notify(objCanal.item_Actual.titulo + ' agregado a favoritos',3);	
					});
				}
		}
		page.metadata.title = new showtime.RichText(objCanal.item_Actual.titulo);
		page.metadata.icon = objCanal.item_Actual.imagen;
		page.metadata.description = new showtime.RichText(objCanal.item_Actual.descripcion);
		page.metadata.glwview = plugin.path + "views/list3.view";
		page.type = "directory";
		page.contents = "items";
		page.loading = false;
	});
	//Listado del mismo item x todo los servers disponibles


	//Pagina de ver video
	plugin.addURI(PREFIX + ":vervideo:(.*):(.*):(.*):(.*):(.*)", function (page, canal, host, titulo, imagen, url_video) {
		page.metadata.background = plugin.path + "views/img/background.png";
		page.type = "directory";
		page.contents = "list";	
		page.metadata.title = 'Cargando video ...';
		page.loading = true;

		titulo = unescape(titulo);
		imagen = unescape(imagen);
		url_video = unescape(url_video);

		if (objCanal == undefined) {objCanal=CanalFactory.createCanal(canal);}
			else {if (objCanal.name != canal) objCanal=CanalFactory.createCanal(canal);}

		var url_servidor=objCanal.geturl_host(url_video);

		var objHost=HostFactory.createHost(host,{"servidor":host});	
		var url_video2= objHost.geturl_video(url_servidor);

		if(url_video2 == 'error')
			{
			page.metadata.title = 'Error cargando video ... ' + unescape(titulo);
			}
		else
			{

			//parental_mode == false)				
			if (service.historyTracking != "no")
				{
				if (service.historyTracking == "todo")
					{
						objHistorial.addItem({
							'canal':canal,
							'titulo':titulo,
							'imagen':imagen,
							'url': url_video,
							'host':host})
					}else{
						if(objHost.esservidoradulto() == false){
							objHistorial.addItem({
								'canal':canal,
								'titulo':titulo,
								'imagen':imagen,
								'url': url_video,
								'host':host})}
					}
				}

			var videoparams = {title: unescape(titulo),sources: [{url: url_video2}],no_fs_scan: true};
			page.source = "videoparams:" + showtime.JSONEncode(videoparams);
			page.type = "video";
			}	
		page.loading = false;
	});	
	//Pagina de ver video



	//TEST
	plugin.addURI(PREFIX + ":test", function(page) {
		page.redirect(PREFIX + ':vercanales:ztestchannel');
	});
	
	/************************************************************************************
	/* var TESTCHANNEL: Objeto que representa el canal TESTCHANNEL	*
	/************************************************************************************/
	var ZTestchannel= function() {	
		//var that=this; //Permite el acceso a metodos publicos desde metodos privados (closures): that.metodo_publico()
		//metodos publicos
		
		/************************************************************************
		/*	funcion getmenu: Devuelve un listado de las subsecciones del canal. *
		/*	Parametros: ninguno													*
		/*	Retorna: Array de objetos Item_menu									*
		/************************************************************************/
		this.getmenu= function(){
		//retorna el Menu
			var array_menu=[
				new Item_menu('Test Videoservers','views/img/folder.png',':vercontenido:ztestchannel:urlvideo:null'),
				new Item_menu('Url directa de video','views/img/folder.png',':vercontenido:ztestchannel:urlvideo:null')
				];
		return array_menu;
		}
		
		/************************************************************************************
		/*	funcion getplaylist: Devuelve un listado del contenido de las subsecciones.     *
		/*	Parametros: 																    *
		/*		page: referencia a la pagina de showtime desde donde se llama a la funcion. * 																*
		/*		tipo: especifica los diferentes tipos de listas soportados por el canal.    *
		/*		url: direccion de la que se debe extraer la lista.							*
		/*	Retorna: Array de objetos Item_menu											    *
		/************************************************************************************/
		this.getplaylist= function (page, tipo, url) {
			var array_playlist=[];
			switch (tipo)
			{
				case "urlvideo":
					page.metadata.title = 'Test Videoservers';			
					array_playlist=testurlvideo();
					break;
			}	
		return array_playlist;
		}
		
		/****************************************************************************************
		/*	funcion getservidores: Devuelve un listado de enlaces a la pelicula en los 			*
		/*							servidores soportados. Sustituye a parseXXXXXpelicula (url)	*
		/*	Parametros: 																    	*
		/*		url: direccion de la que se debe extraer la lista.								*
		/*	Retorna: Array de servidores												    	*
		/****************************************************************************************/
		this.getservidores= function (url)	{
			return false;
		}
		
		/************************************************************************
		/*	funcion gethost: Devuelve la url del host donde se aloja el video	*
		/*					 Sustituye a resolveXXXXXXpelicula(url)				*
		/*	Parametros:															*
		/*		url: direccion de la que se debe extraer la lista.				*
		/*	Retorna: String que representa la url								*
		/************************************************************************/
		this.geturl_host= function (url){
			return url;			
		}
		
		
		//Metodos Privados
		function testurlvideo() {
			//Para probar una url directa de un videoserver
			var array_playlist=[];
			var titulo;
			var imagen = 'views/img/folder.png';
			var url_video;
			var page_uri;
			
			titulo = 'Test Played.To';
			url_video = 'http://played.to/0vpqv384hysv';
			page_uri = ':vervideo:ztestchannel:played:test:views/img/folder.png:';
			array_playlist.push(new Item_menu(titulo,imagen,page_uri,url_video));
			
			titulo = 'Test Youtube No Cypher';
			url_video = 'https://www.youtube.com/watch?v=mzhM6xNB8sQ';
			page_uri = ':vervideo:ztestchannel:youtube:test:views/img/folder.png:';
			array_playlist.push(new Item_menu(titulo,imagen,page_uri,url_video));
			
			titulo = 'Test Youtube Cypher';
			url_video = 'https://www.youtube.com/watch?v=JF8BRvqGCNs';
			page_uri = ':vervideo:ztestchannel:youtube:test:views/img/folder.png:';
			array_playlist.push(new Item_menu(titulo,imagen,page_uri,url_video));			
			
			//var cuadrotexto = showtime.textDialog('Url de video', true, true);
			//url_video=cuadrotexto.input;
			/*
			var array_1 = ['à' ,'è' ,'ì','ò' ,'ù'];
						var pp;
						var kk;
			for (var i=0;i<array_1.length;i++)
				{
					pp=array_1[i];
					kk=array_1[i];
				pp=utf8_encode(pp);
					showtime.trace(array_1[i] + ' - ' + pp.charCodeAt(1) + ' - ' + kk.charCodeAt(0));
				}
			//str_data.charCodeAt(j)
			*/
			
			return array_playlist;
			}	
		
		
	}
	//Propiedades y metodos Estaticos
	ZTestchannel.categoria= function() {return 'test';}
	ZTestchannel.getitem= function() {return new Item_menu('Test Channel',"img/test.png",':vercanales:ztestchannel');}

	CanalFactory.registrarCanal("ZTestchannel",ZTestchannel); //Registrar la clase testchannel	
	//TEST
	

	plugin.addURI(PREFIX + ":start", startPage);
})(this);
