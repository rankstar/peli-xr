/********************************************************************************	
	/* var HOST_VIDEO: Objeto que representa el servidor HOST_VIDEO					*
	/********************************************************************************/
	var HOST_VIDEO= function(params) {
	
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
			var url_video ='error';





			return url_video;	
		}
		
		
	}
	HostFactory.registrarHost("HOST_VIDEO",HOST_VIDEO); //Registrar la clase HOST_VIDEO