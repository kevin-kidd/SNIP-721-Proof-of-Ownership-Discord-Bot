import {useState} from "react";
import {getClient} from "./keplr/helper";
import {setWhitelist} from "./keplr/exec";
import {XCircleIcon} from '@heroicons/react/solid'
import {API_ENDPOINT} from "./config";
import axios from "axios";

const App = () => {

    const [loading, setLoading] = useState(false)
    const [discord, setDiscord] = useState('')
    const [isError, setIsError] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')

    const displayError = (message) => {
        setErrorMessage(message)
        setLoading(false)
        setIsError(true)
    }

    const verifyDiscord = () => {
        if(discord.length === 0) return
        const re = new RegExp(/^((.+?)#\d{4})/)
        if(!re.test(discord)){
            displayError("Incorrect Discord username! Correct format: Username#1234")
            return false
        }
        return true
    }

    const postData = async (signature, discord, address) => {
        return await axios.post(API_ENDPOINT + '/add_discord', {
            address: address,
            signature: signature,
            discord: discord
        })
    }

    const linkDiscord = async () => {
        if(!verifyDiscord()){
            return
        }

        setLoading(true)
        let client = await getClient()
        if(client === undefined) {
            // Display error - unable to grab Keplr client
            displayError("Unable to connect Keplr!")
            return
        }

        let execResponse = await setWhitelist(client)
        if(execResponse === undefined){
            // Display error - set whitelist approval transaction failed!
            displayError("Unable to set whitelisted approval. Please try again.")
            return
        }
        // Post signature, address & token list to the API
        let postResponse = await postData(JSON.parse(localStorage.getItem('signature')), discord, client.address)
        console.log(postResponse)
    }

    return (
      <div className="bg-white py-16 sm:py-24">
          <div className="mx-auto max-w-md px-4 sm:max-w-3xl sm:px-6 lg:max-w-7xl lg:px-8">
              {isError ?
                  <div className="rounded-md bg-red-50 p-4">
                      <div className="flex">
                          <div className="flex-shrink-0">
                              <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
                          </div>
                          <div className="ml-3">
                              <h3 className="text-sm font-medium text-red-800">There was an error while verifying your ownership.</h3>
                              <div className="mt-2 text-sm text-red-700">
                                  <p>
                                      {errorMessage}
                                  </p>
                              </div>
                          </div>
                      </div>
                  </div>
                  :
                  <></>
              }
          </div>
          <div className="relative sm:py-16">
              <div aria-hidden="true" className="hidden sm:block">
                  <div className="absolute inset-y-0 left-0 w-1/2 bg-gray-50 rounded-r-3xl" />
                  <svg className="absolute top-8 left-1/2 -ml-3" width={404} height={392} fill="none" viewBox="0 0 404 392">
                      <defs>
                          <pattern
                              id="8228f071-bcee-4ec8-905a-2a059a2cc4fb"
                              x={0}
                              y={0}
                              width={20}
                              height={20}
                              patternUnits="userSpaceOnUse"
                          >
                              <rect x={0} y={0} width={4} height={4} className="text-gray-200" fill="currentColor" />
                          </pattern>
                      </defs>
                      <rect width={404} height={392} fill="url(#8228f071-bcee-4ec8-905a-2a059a2cc4fb)" />
                  </svg>
              </div>
              <div className="mx-auto max-w-md px-4 sm:max-w-3xl sm:px-6 lg:max-w-7xl lg:px-8">
                  <div className="relative rounded-2xl px-6 py-10 bg-indigo-600 overflow-hidden shadow-xl sm:px-12 sm:py-20">
                      <div aria-hidden="true" className="absolute inset-0 -mt-72 sm:-mt-32 md:mt-0">
                          <svg
                              className="absolute inset-0 h-full w-full"
                              preserveAspectRatio="xMidYMid slice"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 1463 360"
                          >
                              <path
                                  className="text-indigo-500 text-opacity-40"
                                  fill="currentColor"
                                  d="M-82.673 72l1761.849 472.086-134.327 501.315-1761.85-472.086z"
                              />
                              <path
                                  className="text-indigo-700 text-opacity-40"
                                  fill="currentColor"
                                  d="M-217.088 544.086L1544.761 72l134.327 501.316-1761.849 472.086z"
                              />
                          </svg>
                      </div>
                      <div className="relative">
                          <div className="sm:text-center">
                              <h2 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
                                  Verify your ownership.
                              </h2>
                              <p className="mt-6 mx-auto max-w-2xl text-lg text-indigo-200">
                                  Please enter your Discord username and confirm the Keplr popup windows.
                              </p>
                          </div>
                          <form action="#" className="mt-12 sm:mx-auto sm:max-w-lg sm:flex">
                              <div className="min-w-0 flex-1">
                                  <label htmlFor="cta-email" className="sr-only">
                                      Discord
                                  </label>
                                  <input
                                      id="cta-email"
                                      type="text"
                                      value={discord}
                                      onChange={(e) => setDiscord(e.target.value)}
                                      className="block w-full border border-transparent rounded-md px-5 py-3 text-base text-gray-900 placeholder-gray-500 shadow-sm focus:outline-none focus:border-transparent focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600"
                                      placeholder="Discord username (Example#1234)"
                                      required
                                  />
                              </div>
                              <div className="mt-4 sm:mt-0 sm:ml-3">
                                  {loading ?
                                      <button
                                          type="submit"
                                          className="inline-flex block w-full rounded-md border border-transparent px-5 py-3 bg-indigo-500 text-base font-medium text-white shadow hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600 sm:px-10"
                                          disabled
                                      >
                                          <svg className="animate-spin h-5 w-5 mr-3 ..." viewBox="0 0 24 24">
                                              <circle className="opacity-25" cx="12" cy="12" r="10"
                                                      stroke="currentColor" />
                                              <path className="opacity-75" fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                          </svg>
                                          Processing...
                                      </button>
                                      :
                                      <button
                                          type="submit"
                                          onClick={linkDiscord}
                                          className="block w-full rounded-md border border-transparent px-5 py-3 bg-indigo-500 text-base font-medium text-white shadow hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600 sm:px-10"
                                      >
                                          Submit
                                      </button>
                                  }
                              </div>
                          </form>
                      </div>
                  </div>
              </div>
          </div>
      </div>
    )
}

export default App;
