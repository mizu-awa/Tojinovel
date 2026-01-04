export default function Error({
    message
}){
    return(
        <div
            style={{
                padding: "1em"
            }}
        >
            <h1>Error!</h1>
            <p
                style={{
                    paddingLeft: "1em"
                }}
            >
                message: <br />
                {message}
            </p>
        </div>
    )
}