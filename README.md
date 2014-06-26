Peli-Xr - Plugin para Showtime
====================

Showtime => https://showtimemediacenter.com

Info/Soporte del plugin, en el foro de EOL => http://www.elotrolado.net/hilo_plugin-showtime-peli-xr-v0-9-7_1981017

### ¿Qué es Peli-XR?

Es un plugin para showtime que permite el visionado de contenido multimedia de varios sitios webs.
Basicamente es un navegador web que soporta una serie de sitios web q tienen contenido multimedia enlazado. Seria algo parecido al addon pelisalacarta para xbmc (que es una autentica pasada).
Ademas ahora gracias al usuario SuperBerny, que se ha portado el plugin livestream xbmc, es posible tambien visualizar contenidos de canales de tv. Si os gusta esto os animo a q os pasais x aqui para ayudar a la gente q se encarga de mantener la lista de canales https://groups.google.com/forum/?hl=es#!forum/lista-livestreams.

### ¿Que contenido soporta?

Peliculas, series, anime, adultos, canales tv

### ¿Que servidores de video soporta?

allmyvideos, bestreams, filenuke, magnovideo, mightyupload,movs hare, novamov, nowvideo, playedto, streamcloud, videobam, videoweed, vidspot, vk, xvideos, xhamster

### ¿Cual es la version minima requerida de showtime?

No aconsejo una menor de 4.6.4 q es actualmente la ultima version stable q hay. No obstante las ultimas versiones q hay suelen ir bien aunque sean betas.

### ¿Como se instala el plugin?

Tan simple como bajar el zip, copiar a un pendrive o al hdd de la ps3, y desde el showtime, nos vamos al navegador de dispositivos, buscamos el zip, le damos y ya estara instalado.

### ¿Por que hay dos versiones?

Una seria la version inicial tal y como fue concebida, y la otra una version con una proteccion de acceso a la seccion de adultos para evitar algun susto con los mas peques de la casa, toda esta idea fue gracias al usuario aldostools.
La version normal, es basicamente la version inicial como fue concebida inicialmente. Se puede habilitar de adultos desde opciones del plugin de una manera facil.
Mientras q en la version parental no se hace referencia en ningun caso a ninguna seccion de adultos. Para activar esta seccion hay q irse a opciones del plugin, y veremos q hay una casilla de texto q pone licencia (fula como una casa no hay licencia de ningun tipo), hay tendremos q introducir la contraseña para desbloquear el acceso a los canales de adultos. Una vez q entramos a algun canal la seccion queda desabilitada de nuevo y es necesaria volver activarla (se q puede ser un coñazo, pero aqui prima seguridad). Sobre la contraseña, la contraseña se guarda codificada en md5 en la variable licencia_md5, asi q si alguien quiere cambiarla (recomendable), tiene q sustituirla el valor de esa variable (linea 30), por la clave q queramos codificada en md5. Por defecto tiene esta password: not4kids

### Añadir paginas / servidores

Si te ves capaz puedes añadir los q quieras, fijate q yo he sido capaz de hacerlo y no tengo ni puta idea de js. He tratado de intentar de dejar el codigo claro, aunque es posible q veias cosas raras, aunque si me preguntais os puedo orientar. Algun dia con tiempo hare un tutorial con un ejemplo de como agregar una pagina / servidor

### Reportar bugs / Problemas

Pues la verdad es q si ves algun problema, y lo comunicas tratare de arreglarlo siempre dentro de mis posibilidades. Si vas a reportar un problema trata de ser lo mas claro y preciso ya q asi me ayudas mucho y puedo ir a tiro a fijo al problema.


### TODO
- Crear una biblioteca personal de pelis y series, parseada con TMDB
- Soporte completo para youtube
- Soporte para newct series ?¿?¿?¿?
- soporte para series.ly, tengo q chaparme la api q tienen http://api.series.ly/docs/guide.html. Uff


### FAQ
 1. No me funciona la seccion adultos
-  Por defecto esta desactivada esta opcion. Se activa en configuracion del plugin, poner la opcion adultos activada.

 2. ¿Como se instala el plugin?
- Copiais al HDD de la ps3 o a un usb. Desde el showtime, desde el navegador de dispositivos buscais el zip y le dais y ya se instala.

 3. Esto es una mierda y se me cuelga constamente
- Prueba con otra version del showtime


### AGRADECIMIENTOS

- A chuyo31, q fue x el q descubri el rollo esti del showtime, navi-x, streamhome, ....
- A la gente de http://www.crystalxp.net/ q es donde he sacado los iconos en png.
- A SuperBerny, aldostools, klaxnek, que han colaborado en esto.
- A Andreas Öman x el showtime.
- A Fábio Ferreira x los plugins q se ha currado para el showtime.
- A toda la gente q hizo y hace posible la scene en ps3.
- A hermes x cuidarme la ps3 con el controlfan.
- Y si me olvido de alguien a ese tb.

