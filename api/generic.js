// --------------- FONCTIONS ASSOCIEES AUX REQUETES D'API (ici juste fichiers internes) ---------------

/* Fetch une url
    Paramètres :
        - une url
    Renvoie :
        - la réponse reçue par le serveur au bon format
*/
async function fetchDataFromApi (url) {
    const response = await fetch(url)

    let results
    if (response.ok) {
        results = await response.json()
    } else {
        throw new Error(`Mauvaise réponse du serveur - ${response}`)
    }

    return results
}