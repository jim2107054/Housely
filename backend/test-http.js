import http from 'http';

http.get('http://10.125.51.98:3000/api/houses/top-locations', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Body:', data);
  });
}).on('error', err => console.error(err));
