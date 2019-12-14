import { environment } from "../common/environment";
import fetch from 'node-fetch'

export class CredentialManager {
    private _token: string | undefined

    get token() { return this._token }
    set token(token) { this._token = token}

    public static login(email:string, password:string): Promise<CredentialManager> {
        console.log("Já tá aqui brabo");
        var body = {
            'email':email,
            'password':password
        }

        return new Promise((resolve, reject) => {
            fetch(environment.log.url+'/users/authenticate', {
                headers: { "Content-Type": "application/json; charset=utf-8" },
                method: 'POST',
                body: JSON.stringify(body)
            })
                .then(response=>response.json())
                .then(json=>{
                    console.log(json['accessToken'])
                    const credential = new CredentialManager()
                    credential._token=json['accessToken']
                    resolve(credential)
                })
                .catch(error=>{
                    reject(error)
                })
        })
    }
}
