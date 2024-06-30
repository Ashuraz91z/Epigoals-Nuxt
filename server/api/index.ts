export default defineEventHandler((event) => {
  setResponseStatus(event, 200);
  return {
    message: "API Created By Ashuraz91",
  };
});
