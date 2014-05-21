	/************************************************************************************
	/* var PeliculasCanal: Objeto que representa el canal PeliculasCanal en Categoria	*
	/************************************************************************************/
	var Oranline= function() {	
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
				new Item_menu('Estrenos de cine','views/img/folder.png',':vercontenido:oranline:tipoestrenoscine:'+ escape('http://www.oranline.net/ver/Pel%C3%ADculas/estrenos-de-cine/')),
				new Item_menu('Estrenos Rip','views/img/folder.png',':vercontenido:oranline:tiporip:'+ escape('http://www.oranline.net/ver/Pel%C3%ADculas/estrenos-rip/'))
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
			case "tipobrdvd":
				page.metadata.title = "Oranline - Estrenos de Cine";
				var params={'url_servidor': unescape(url_2),
					'page_uri': ':verenlaces:oranline:',
					'uri_siguiente': ':vercontenido:oranline:tipo1:',
					'subtitulo':false}	
				array_playlist=this.parseoranlinetipodefault(url,params);
				break;
			case "tipoestrenoscine":
				page.metadata.title = "Oranline - Estrenos Rip";
				var params={'url_servidor': unescape(url_2),
					'page_uri': ':verenlaces:oranline:',
					'uri_siguiente': ':vercontenido:oranline:tipo1:',
					'subtitulo':false}	
				array_playlist=this.parseoranlinetipodefault(url,params);
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
			var url_video;
			var servidor;
			var idioma;
			var calidad;
			var descripcion;
		
			//Añadir aqui codigo necesario para obtener:	url_video, servidor, idioma y calidad
		
		
			
			var params={
				"url_video" : url_video,
				"servidor" : servidor,
				"idioma" : idioma,
				"calidad" : calidad
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
		
		
		this.parseoranline= function (params) 
		{	
			/*var params={'url_servidor': ,'page_uri': ,'uri_siguiente': ,'subtitulo': }*/
			var numero_pagina = parseInt(extraer_texto(params.url_servidor,'page/','/'));			
			var file_contents = get_urlsource(params.url_servidor);

			var ultima_pagina = extraer_texto(file_contents,'<span class="pages">','</span>');
			ultima_pagina = ultima_pagina.substr(ultima_pagina.lastIndexOf("of "));
			file_contents = extraer_texto(file_contents,'<div class="review-box-container">','<span class="pages">');
			var array_aux = extraer_html_array(file_contents,'<div class="post-thumbnail">','<div class="review-box review-box-compact" style="width: 140px;">');
			file_contents = "";
		
			var titulo;
			var imagen;
			var url_video;	
			var array_playlist=[];
			
			for (var i=0;i<array_aux.length;i++)
				{
					titulo=extraer_texto(array_aux[i],'title="','">');
					//if (params.subtitulo) titulo=titulo + ' ' + extraer_texto(array_aux[i],'<p>','<br/>');
					if (titulo !='') {			
						imagen=extraer_texto(array_aux[i],'<img src="','"');
						url_video=extraer_texto(array_aux[i],'<a href="','"');
						array_playlist.push(new Item_menu(titulo,imagen,params.page_uri,url_video));
					}	
				}
		
			//paginador
			var pagina_siguiente = (parseInt(numero_pagina) + 1);
			if(numero_pagina<ultima_pagina)
				{
					array_playlist.push(new Item_menu('Siguiente',"views/img/siguiente.png",params.uri_siguiente,params.url_servidor.replace('page/' + numero_pagina,'page/' + pagina_siguiente)));		
				}
		
		return array_playlist;
		}
		
		
		this.parseoranlinetipodefault = function(url_servidor,params){
			url_servidor=unescape(url_servidor);
			var array_playlist=[];

			var file_contents = get_urlsource(url_servidor);
			if(file_contents!=false) array_playlist= this.parseoranline (params);
						
		return array_playlist;
		}
		
		
		//Metodos Privados
		
		
	}
	//Propiedades y metodos Estaticos
	oranline.categoria= function() {return 'peliculas';}
	oranline.getitem= function() {return new Item_menu('Oranline',"views/img/folder.png",':vercanales:oranline');}

	CanalFactory.registrarCanal("oranline",Oranline); //Registrar la clase PeliculasCanal
