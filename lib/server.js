import http from 'http';

function onRequest(req, res) {
  try {
   res.statusCode = 415;
   res.end();
  } catch (error) {
    const time = new Date().toISOString();
    console.error(`${time} ${JSON.stringify(error)}`);
    res.statusCode = 503;
    res.end();
  }
}

http.createServer(onRequest).listen(process.env.PORT || 80);
