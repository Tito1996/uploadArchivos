const http=require('http');
const url=require('url');
const fs=require('fs');
const formidable = require('formidable');

const mime = {
   'html' : 'text/html',
   'css'  : 'text/css',
   'jpg'  : 'image/jpg',
   'ico'  : 'image/x-icon',
   'mp3'  : 'audio/mpeg3',
   'mp4'  : 'video/mp4'
};

const servidor=http.createServer((pedido, respuesta) => {
  const objetourl = url.parse(pedido.url);
  let camino='public'+objetourl.pathname;
  if (camino=='public/')
    camino='public/index.html';
  encaminar(pedido,respuesta,camino);
});

servidor.listen(8888);

function encaminar (pedido,respuesta,camino) {
  
    switch (camino) {
      case 'public/subir': {
        subir(pedido,respuesta);
        break;
      }	
      case 'public/listadofotos': {
        listar(respuesta);
        break;
      }			
      default : {  
        fs.stat(camino, error => {
          if (!error) {
              fs.readFile(camino,(error,contenido) => {
            if (error) {
              respuesta.writeHead(500, {'Content-Type': 'text/plain'});
              respuesta.write('Error interno');
              respuesta.end();					
            } else {
              const vec = camino.split('.');
              const extension=vec[vec.length-1];
              const mimearchivo=mime[extension];
              respuesta.writeHead(200, {'Content-Type': mimearchivo});
              respuesta.write(contenido);
              respuesta.end();
            }
          });
          } else {
            respuesta.writeHead(404, {'Content-Type': 'text/html'});
            respuesta.write('<!doctype html><html><head></head><body>Recurso inexistente</body></html>');		
            respuesta.end();
          }
        });	
      }
    }	
  }


function subir(pedido,respuesta) {
    
    //Creamos un objeto llamando al método IncomingForm.
    const entrada=new formidable.IncomingForm();

    //Definimos el path donde se almacenará el archivo en el servidor.
    entrada.uploadDir='upload';

    //Llamamos al método parse pasando 'pedido' donde se encuentran los datos del archivo adjunto para ser procesado.
    entrada.parse(pedido);

    //El evento fileBeing se dispara cuando el archivo se está por grabar en el servidor, aquí definimos el path y nombre del archivo a grabar. 
    //Lo grabaremos en la carpeta upload que se encuentra en la carpeta public y el nombre de archivo utilizamos el nombre original que tiene en el cliente y lo podemos sacar del parámetro file.
    entrada.on('fileBegin',(field, file) => {
        file.path = "./public/upload/"+file.name;
    });	

    //El evento end se dispara cuando el archivo ya se almacenó en el servidor, aquí generamos dinámicamente una página HTML informando al usuario.
    entrada.on('end', function(){
        respuesta.writeHead(200, {'Content-Type': 'text/html'});
        respuesta.write('<!doctype html><html><head></head><body>'+'Archivo subido<br><a href="index.html">Retornar</a></body></html>');		
        respuesta.end();
        });	
}

//La función listar utiliza el módulo 'fs' llamando a la función readdir que lee todos los archivos de un directorio y luego mediante una función anónima recibimos un error y un vector con todos los archivos de dicho directorio.
function listar(respuesta) {
    fs.readdir('./public/upload/',(error,archivos) => {
        let fotos='';
        for(let x=0;x<archivos.length;x++) {
            fotos += `<img src="upload/${archivos[x]}"><br>`;
        }
        respuesta.writeHead(200, {'Content-Type': 'text/html'});
        respuesta.write(`<!doctype html><html><head></head>
                        <body>${fotos}<a href="index.html">
                        Retornar</a></body></html>`);
        respuesta.end();	  
    });	
}
//Como podemos ver generamos una página dinámica con las etiquetas HTML 'img' que hacen referencia a todos los nombres de archivos almacenados en la carpeta upload.

console.log('Servidor web iniciado');

