import Cookies from 'js-cookie'
import { redirect } from '@sveltejs/kit'

/** @type {import('./$types').LayoutServerLoad} */
export function load() {
    console.log('run')
    const authCookie = Cookies.get('authcookie')
        if(authCookie && authCookie !== 'false'){
            return
        }
    throw redirect(307, '/')
}