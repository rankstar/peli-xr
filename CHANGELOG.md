###### Changelog
### 0.10.4b:
- Arreglado NewPctSeries
- Arreglado Almyvideos (nuevo bug)
- Sustituir Oraline.net por Oraline.com
- Añadido Host vaughnlive (regex)
- Actualizado canal 'Peliculas De Sebas'

### 0.10.3b:
- Arreglado Almyvideos
- El canal TVonline ha sido completamente remodelado. Ahora tenemos soportes para listas XML, JSON, PLX y M3U.
- La opcion de las listas personales ha sido desactivada.
- Añadido Canal 'Peliculas De Sebas' en el apartado de Peliculas


### 0.10.2b:
- Redtube reparado
- Añadida la funcion de busqueda en seriesflv


### 0.10.1b:
- Limpieza de codigo
- Servidores: Arreglado Movshare.net; Eliminados Magnovideo y Mightyupload; Añadido VideoMega
- Deteccion quota exceeded en series.ly
- NewPCT: Corregido 
- NewPctSeries: no funciona la paginacion en la pagina de los capitulos de una serie. El resto todo OK


### 0.10.0b:
- Añadida funcion post_urlheaders (me hacia falta para series.ly)
- Canal de series.ly activo - Api de Series.ly activa (gracias a los admins de series.ly)
- Añadido String.prototype.format:  Formatea el String sustituyendo {0}, {1},...{n} por los argumentos (0..n) pasados a la funcion.
- Añadida funcion generica get_SerieTvdb: Obtiene los datos de una serie de thetvdb.com
- LiveStream: Eliminar getDate (tardaba mucho) y añadir recursividad para leer listas multiples.
- Añadido canal Lista M3U con tres listas autoactualizables y una personal configurable en ajustes.	
- Añadido canal Lista PLX con listas autoactualizables y una personal configurable en ajustes.	

### 0.9.9

- Release

### 0.9.9 beta 1:
- Corregido canal LiveStream (eliminar listas obsoletas)
- Corregido bug en peliculas NewPct
- Eliminado canal SpliveTV (las listas ahora esta encriptadas)
- Añadido gestion de errores en 'function get_urlsource(url_servidor)': retorna el mensaje de error en caso de producirse
- Añadido canal de series Seriesflv.net
- Añadido canal de series SeriesDanko.com
- Corregido el problema de los titulos en oranline
- Añadido a servidores de video Youtube.
- Añadido canal de peliculas Pelispekes.com 
- (Desactivado) Añadido canal de peliculas Series.ly 
- (Desactivado) Añadido canal de series Series.ly 
- Deteccion mejorada de contenido no disponible vk 
- Deteccion mejorada de contenido no disponible videspot 

### 0.9.8

- Release

### 0.9.8 beta 2:
- Corregido bug en function extraer_texto.
- LiveStreams:
	- Ahora las listas pueden ser recopilaciones de otras listas.
	- Descartar canales cuyo nombre contenga entre sus ultimas 5 letras la palabra 'off'
- Añadido canal de peliculas Oranline.
- Newpct.com esta teniendo problemas con algunos ISP, por lo que cambiamos a www.newpct1.com
- Corregido un bug en favoritos, ahora deberia funcionar bien.
- Añadida funcion utf8_decode().

### 0.9.8 beta:
- Cambio de todo el codigo js, ahora el codigo esta basado en objetos, Gracias a SuperBerny q se lo ha currado.
- Añadidos mas canales en la seccion de tvonline, Gracias a SuperBerny
- Solucionado el bug de las busquedas con espacios en peliculaspepito.
- ¿?Bug peliculascoco crashea. Lo he probado tanto en la ps3 como en ubuntu y no crashea.
- Eliminada opcion Mas vistas en seriespepito, ya no aparece en la pagina esa opcion.
- Animeflv, corregido el problema de q el primer elemento q se listaba era un link de publi, ya no sale mas.
- Corregido el problema de redtube q no dejaba reproducir videos.
- Implementada la parte de series de pordede

- Historial:	Solo se guarda la primera vez en el dia que se visiona un video (url). Es decir si ayer vi un determinado video y hoy vuelvo a verlo se guardara el acceso de ayer y el de hoy, pero si hoy lo veo 3 veces, por ejemplo, solo almacenamos la primera vez.
- Favoritos:	Si guardamos un favorito en la pagina 'vercontenido' se guarda el enlace a la pagina de enlaces ('verenlaces'), pero si lo guardamos desde la pagina de 'verenlaces' lo que se almacena es el link al video. En la pagina de Favoritos se pueden diferenciar por que el titulo incluye o no el nombre del host. En el caso de los canales de TV siempre se guarda el enlace al video.	
- Renombrado 'playlist', 'playlist2' por 'vercontenidos' y 'verenlaces' respectivamente
- Reescrito StoreHistorial.
- 'Pagina de ver video': modificado el tema del historial
- Modificada 'Pagina Historial'
- Canal: Añadido atributo canal.categoria
- CanalFactory: 
	Completar la informacion de los metodos que ofrece
	Modificar metodo createCanal para añadir la categoria a Canal
	Solucionar bug: no permitia el acceso a cuadro_busqueda desde un canal heredado.
- En varias metodos parseNOMBRECANALxxxxx se asignaba var page_uri= ':verenlaces:NOMBRECANALcapitulo'. Esto no es correcto debe ser: var page_uri= ':verenlaces:NOMBRECANAL'
- NewPct: solucionar bugs y modificar metodos para heredarlos.
- Añadido canal NewPct Series HD
- LiveStreams: 
	Ahora acepta enlaces del tipo: http....m3u8 y http...mp4?xxxx
	Añadidas nuevas listas, con fecha de actualizacion.
	Acceso independiente a cada lista o al listado de todos los enlaces.
	La lista Personal (fijada en ajustes) permite tanto enlaces del tipo http...xml como los alojados en http://pastebin.com
	

### 0.9.7:

- Terminada la parte de peliculas de pordesde.com
- Solucionado el problema con played.to (he cambido el metodo).
- Corregido codigo en newpct. No se veia nada online
- Agregada la parte de livestreams q se la ha currado enterita el usuario SuperBerny.
	--> Añadido icono tvonline.png en: plugin.path + "img/tvonline.png"
	--> Añadido icono livestreams.png en: plugin.path + "img/livestreams.png"
	--> Añadida opcion: "Añadir lista de canales LiveStream (xml)" en ajustes
	--> Añadido item TV online en menu principal
	--> Añadida seccion //Pagina TVonline
	--> Añadido case "livestream": en //Listado de items generico
	--> Añadido case "rtmp": en //Pagina de ver video 
	--> Añadimos la funcion startsWith al prototipo de String
	--> Añadimos la funcion endsWith al prototipo de String
	--> Añadimos la funcion trim al prototipo de String
	--> Añadimos la funcion toProperCase al prototipo de String
	--> Añadimos la funcion al prototipo de Array para ordenar arrays de objetos por multiples campos
	--> Añadimos la funcion al prototipo de Array para eliminar elementos repetidos en un array de objetos segun un campo determinado

### 0.9.6:
- Añadidas opciones en historial. Guardar todo, nada, o todo menos adultos (casi todo).
- Corregido un bug q hacia q todo lo reproducido de animeflv.net no se guardaba el titulo en el historial.
- Historial solo aparece si hay algo, si no hay siempre oculto.
- Agregado modo parental (para evitar sustos), gracias a aldostools x las ideas.
	Como funciona:
		- Hay q poner la variable var parental_mode a true.
		- Hay q poner el texto en md5 q queramos usar para desbloquear el modo en la variable licencia_md5. En el codigo se ve la clave q yo he puesto pero q cada uno ponga la q quiera.
		- Con todo esto puesto, en las opciones del plugin ahora no aparece nada q haga referencia a ningun modo adulto, si no q en su lugar aparece un casilla de texto q pone licencia, q es donde debemos poner el codigo para desbloqueo.
		- Ahora la primera vez q carga el menu principal aparece la ventana de adultos, y una vez q navegamos x cualquier lado desaperece, x lo q habria q poner el codigo otra vez (es un coñazo, pero esta pensando x seguridad)
		- En este modo no se guarda nunca historial del contenido adultos.
	Si no esta claro preguntarme y lo explico mejor, pero x defecto este modo no esta activo, asi q el q quiera usar el plugin como hasta ahora no tiene q hacer nada.
- Añadido redtube. Gracias a aldostools x el codigo.
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
- Añadida deteccion para filenuke.net (solo lo detecto no lo proceso)
- Añadida deteccion para movshare.me (solo lo detecto no lo proceso)
- Añadida deteccion para nowvideo.ws (solo lo detecto no lo proceso)
- Añadida deteccion para novamov.me (solo lo detecto no lo proceso)

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
- Añadida deteccion para contenido borrado de vidspot (a ver q tal funciona)
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
