import riotLogo from "../images/riot-logo.svg"

export default function Header() {
    return (
        <div>
            <img src={riotLogo} alt="logo" className="riotLogo"></img>
            <h1>Welcome to league of legends player finder!</h1>
        </div>
    )
}