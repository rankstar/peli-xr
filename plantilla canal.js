	/************************************************************************************
	/* var PeliculasCanal: Objeto que representa el canal PeliculasCanal en Categoria	*
	/************************************************************************************/
	var PeliculasCanal= function() {	
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
				new Item_menu(,'views/img/folder.png',),
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
			var url_video;
			var servidor;
			var idioma;
			var calidad;
			var descripcion;
		
		
			/*
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
			*/
		
		
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
		
		
	}
	//Propiedades y metodos Estaticos
	//PeliculasCanal.padre='ClasePadre';
	PeliculasCanal.categoria= function() {return 'Categoria';}
	PeliculasCanal.getitem= function() {return new Item_menu('PeliculasCanal',"views/img/folder.png",':vercanales:peliculascanal');}

	CanalFactory.registrarCanal("peliculascanal",PeliculasCanal); //Registrar la clase PeliculasCanal
