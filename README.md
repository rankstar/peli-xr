###### Changelog

### X.X.X:
- Cambio de todo el codigo js, ahora el codigo esta basado en objetos, Gracias a SuperBerny q se lo ha currado.
- A�adidos mas canales en la seccion de tvonline, Gracias a SuperBerny
- Solucionado el bug de las busquedas con espacios en peliculaspepito.
- �?Bug peliculascoco crashea. Lo he probado tanto en la ps3 como en ubuntu y no crashea.
- Eliminada opcion Mas vistas en seriespepito, ya no aparece en la pagina esa opcion.
- Animeflv, corregido el problema de q el primer elemento q se listaba era un link de publi, ya no sale mas.
- Corregido el problema de redtube q no dejaba reproducir videos.


### 0.9.7:

- Terminada la parte de peliculas de pordesde.com
- Solucionado el problema con played.to (he cambido el metodo).
- Corregido codigo en newpct. No se veia nada online
- Agregada la parte de livestreams q se la ha currado enterita el usuario SuperBerny.
	--> A�adido icono tvonline.png en: plugin.path + "img/tvonline.png"
	--> A�adido icono livestreams.png en: plugin.path + "img/livestreams.png"
	--> A�adida opcion: "A�adir lista de canales LiveStream (xml)" en ajustes
	--> A�adido item TV online en menu principal
	--> A�adida seccion //Pagina TVonline
	--> A�adido case "livestream": en //Listado de items generico
	--> A�adido case "rtmp": en //Pagina de ver video 
	--> A�adimos la funcion startsWith al prototipo de String
	--> A�adimos la funcion endsWith al prototipo de String
	--> A�adimos la funcion trim al prototipo de String
	--> A�adimos la funcion toProperCase al prototipo de String
	--> A�adimos la funcion al prototipo de Array para ordenar arrays de objetos por multiples campos
	--> A�adimos la funcion al prototipo de Array para eliminar elementos repetidos en un array de objetos segun un campo determinado

### 0.9.6:
- A�adidas opciones en historial. Guardar todo, nada, o todo menos adultos (casi todo).
- Corregido un bug q hacia q todo lo reproducido de animeflv.net no se guardaba el titulo en el historial.
- Historial solo aparece si hay algo, si no hay siempre oculto.
- Agregado modo parental (para evitar sustos), gracias a aldostools x las ideas.
	Como funciona:
		- Hay q poner la variable var parental_mode a true.
		- Hay q poner el texto en md5 q queramos usar para desbloquear el modo en la variable licencia_md5. En el codigo se ve la clave q yo he puesto pero q cada uno ponga la q quiera.
		- Con todo esto puesto, en las opciones del plugin ahora no aparece nada q haga referencia a ningun modo adulto, si no q en su lugar aparece un casilla de texto q pone licencia, q es donde debemos poner el codigo para desbloqueo.
		- Ahora la primera vez q carga el menu principal aparece la ventana de adultos, y una vez q navegamos x cualquier lado desaperece, x lo q habria q poner el codigo otra vez (es un co�azo, pero esta pensando x seguridad)
		- En este modo no se guarda nunca historial del contenido adultos.
	Si no esta claro preguntarme y lo explico mejor, pero x defecto este modo no esta activo, asi q el q quiera usar el plugin como hasta ahora no tiene q hacer nada.
- A�adido redtube. Gracias a aldostools x el codigo.
- Retocada la funcion extraer_html_array()
- Arreglado un problema al listar contenido de vodly
- Desablitado played.to, no se q mierdas pasa pero no va. He estado pegando con el server y lo veo todo bien, pero no va asi q de momento lo dejo aparcado.
- Implementado peliculascoco parcialmente. Necesitaria meterle mas resolvers para los videohost y la busqueda (ahora mismo desde la web no me funciona).
- Implementado pordesde parcialmente. Solo peliculas y falta la busqueda
- Corregido el problemas con peliculaspepito


### 0.9.5:
- Cambios en el codigo para newpct
- Eliminadas peliculasyonkis, y seriesyonkis
- Agregado Last- Prime Episodes a vodly. Gracias a klaxnek
- A�adida deteccion para filenuke.net (solo lo detecto no lo proceso)
- A�adida deteccion para movshare.me (solo lo detecto no lo proceso)
- A�adida deteccion para nowvideo.ws (solo lo detecto no lo proceso)
- A�adida deteccion para novamov.me (solo lo detecto no lo proceso)

### 0.9.4:
- Agregado en series pepito opcion ultimos capitulos de estrenos. Gracias a klaxnek 
- Agregado soporte para novamov
- Agregado a peliculas newpct seccion peliculas (aunque no me mola nada esta web para streaming)
- Agregado soporte para videobam
- Agregado soporte para videoweed
- Corregido bug en peliculasyonkis. Gracias a SuperBerny x avisarme
- Corregido el bug del historial (ahora creo q ya esta).
- Agregado soporte para vk
- Agregado seccion de anime.
- Agregado a anime animeflv.net
- Agregado a adultos, xhamster
- Agregado soporte para mightyupload.
- Agregado soporte para movshare
- Mejorado soporte para nowvideo
- Agregado soporte para filenuke
- Agregado soporte para bestreams
- Agregado a peliculas vodly seccion peliculas
- Agregado a series vodly seccion series
- Mejorado soporte para novamov
- Favoritos se oculta si no hay contenido
- Historial se oculta si esta marcada la opcion de no guardar historial

### 0.9.3:
- Agregado soporte para nowvideo (lo q he probado me parece bastante lento)
- Reemplazadas funciones httpget y httppost, por httpreq
- Limpieza de morralla en el codigo
- A�adida deteccion para contenido borrado de vidspot (a ver q tal funciona)
- Agregado a peliculas, peliculaspepito
- Agregado a series, seriespepito
- Corregido un bug, q hacia q el historial se duplicara y triplicara y yo q se q mas.

### 0.9.2:
- Version publica

### 0.9.1:
- Agregado a series, seriesyonkis
- Agregado a peliculas, peliculasyonkis
- Agregado a adultos, xvideos
- Agregado soporte para allmyvideos
- Agregado soporte para streamcloud
- Agregado soporte para played.to
- Agregado soporte para vidspot
- Agregado soporte para magnovideo.
- Agregado sistema de historial para videos reproducidos
- Agregado sistema de favoritos para agregar videos

### 0.9.0:
- Version test

## TODO
- Crear una biblioteca personal de pelis y series, parseada con TMDB
- Soporte completo para youtube
- Soporte para newct series ?�?�?�?
- soporte para series.ly, tengo q chaparme la api q tienen http://api.series.ly/docs/guide.html. Uff
- Revisar todo el codigo y volver a limpiar morralla

## FAQ
### 1. No me funciona la seccion adultos
-  Por defecto esta desactivada esta opcion. Se activa en configuracion del plugin, poner la opcion adultos activada.

### 2. �Como se instala el plugin?
- Copiais al HDD de la ps3 o a un usb. Desde el showtime, desde el navegador de dispositivos buscais el zip y le dais y ya se instala.
