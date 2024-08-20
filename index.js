const functions = require('@google-cloud/functions-framework');
const { createClient } = require("@supabase/supabase-js");
const cors = require('cors');
const sgMail = require('@sendgrid/mail');

const supabase = createClient(process.env.url, process.env.key);

const corsMiddleware = cors({ origin: true });

functions.http('helloHttp', (req, res) => {
  corsMiddleware(req, res, async () => {
    const email = req.body.email;
    const status = {};
    let message = "";

    let { data, error } = await supabase.from('users').select('password').eq('email', email);

    let json = {
      email: email
    }

    let { pdata, perror } = await supabase.from("passrecovery").insert(json);

    status.status = data.length;

    if (status.status) {
      sgMail.setApiKey(process.env['SENDGRID_API_KEY']);
      const msg = {
        to: email, // Change to your recipient
        from: { email: process.env['emailuser'], name: 'Doctor8' }, // Change to your verified sender
        subject: 'Recuperação de senha',
        text: 'Sua senha é: ' + data[0].password,
        html: 'Sua senha é: <b>' + data[0].password + '</b>',
      };
      
      try {
        await sgMail.send(msg);
        message = 'Recuperação: ' + email;
      } catch (error) {
        message = error.response.body;
        console.error(error.response.body);
      }
    }

    res.send(status);
  });
});
