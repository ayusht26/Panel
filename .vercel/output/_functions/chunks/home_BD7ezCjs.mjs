import { a as getHomepage } from './weebcentral_CBz69B5Q.mjs';

const GET = async () => {
  try {
    const data = await getHomepage();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    console.error("Homepage error:", e);
    return new Response(JSON.stringify({ error: "Failed to fetch homepage" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
