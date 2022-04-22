import { eventHandler, useCookies, useQuery, useMethod, setCookie } from 'h3'

export default eventHandler((event) => {
  setCookie(event, 'specialCOokie', 'itsveryspecial')
  console.log('cookies:', useCookies(event))
  console.log('method', useMethod(event))
  console.log('query', useQuery(event))
  event.res.statusCode = 201;
  console.log(event.context)
  console.log(event)
  return 'hello world'
})
