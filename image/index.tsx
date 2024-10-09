import { Frog } from 'frog'
import axios from "axios";

export const app = new Frog()

app.hono.get('/:remote_url/', async (c) => {
    const remote_url = c.req.param('remote_url');
    console.log(remote_url)
    let response = await axios.get(remote_url)
  
    return new Response(response.data, {
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-store',
      },
    });
  });
  