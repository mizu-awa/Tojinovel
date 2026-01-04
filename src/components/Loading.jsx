import { LoaderCircle } from "lucide-react";

export default function Loading(){
    return(
        <div
            style={{
                width: "100vw",
                height: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column"
                }}
            >
                <div>
                    <LoaderCircle size={100} className="spin" />
                </div>
                <p>
                    Loading...
                </p>
            </div>
        </div>
    )
}