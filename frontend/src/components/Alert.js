import {XCircleIcon} from "@heroicons/react/solid";
import {CheckCircleIcon} from "@heroicons/react/outline";


export const Alert = (props) => {
    if(props.alertType === 'success'){
        return(
            <div className="rounded-md bg-green-50 p-4">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-green-800">Order completed</h3>
                        <div className="mt-2 text-sm text-green-700">
                            <p>Your Discord has been successfully linked. You must have at least one NFT in your inventory to keep your role.</p>
                        </div>
                        <div className="mt-4">
                            <div className="-mx-2 -my-1.5 flex">
                                <button
                                    type="button"
                                    className="ml-3 bg-green-50 px-2 py-1.5 rounded-md text-sm font-medium text-green-800 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-green-50 focus:ring-green-600"
                                    onClick={props.closeAlert}
                                >
                                    Dismiss
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    } else if(props.alertType === 'error') {
        return(
            <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">There was an error while verifying your ownership.</h3>
                        <div className="mt-2 text-sm text-red-700">
                            <p>
                                {props.errorMessage}
                            </p>
                        </div>
                        <div className="mt-4">
                            <div className="-mx-2 -my-1.5 flex">
                                <button
                                    type="button"
                                    className="ml-3 bg-red-50 px-2 py-1.5 rounded-md text-sm font-medium text-green-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-green-50 focus:ring-green-600"
                                    onClick={props.closeAlert}
                                >
                                    Dismiss
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
    return <></>
}