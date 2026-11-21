export default {
  async fetch(request, env) {
    // 1. Solo aceptar peticiones tipo POST
    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    // 2. Validar que la petición traiga tu contraseña secreta
    const apiKey = request.headers.get("X-Api-Key");
    if (!apiKey || apiKey !== env.SECRET_TOKEN) {
      return new Response("Unauthorized", { status: 401 });
    }

    try {
      const payload = await request.json();

      // 3. Evitar menciones masivas por seguridad
      payload.allowed_mentions = { parse: [] };

      // 4. Reenviar al webhook oculto de Cloudflare
      const discordResponse = await fetch(env.WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      return new Response("OK", { status: discordResponse.status });
    } catch (error) {
      return new Response("Bad Request", { status: 400 });
    }
  },
};
