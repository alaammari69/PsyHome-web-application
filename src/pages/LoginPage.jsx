import { Field, FieldLabel, FieldSet, FieldGroup, FieldDescription, FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useNavigate} from "react-router-dom"

export default function LoginPage() {

    // use state acts as a trigger for each variable so when any have a change using the setVariable method, the page refreshes automatically
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState(false)

    // for navigation between pages
    const navigate = useNavigate()

    // async for fetching call with headers and error handling
    async function OnLogin() {
        try {
            const api_url = import.meta.env.VITE_API_URL
            console.log(api_url)
            const response = await fetch(api_url+"/psychiatrist_login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email, password: password })
            })
            const data = await response.json()
            if (!response.ok) {
                setError(data.message || "Login failed")
            } else {
                // redirect or save token
                localStorage.setItem("token", data.token)
                console.log("sucesss")
                console.log(data.token)
            }
        } catch (err) {
            setError("Something went wrong")
        }
    }
    function OnSignup(e) {
        try {
            navigate("/dashboard")
        } catch (e) {
            
        }
    }

    const errors_list = []

    return (
        <div>
            <FieldSet>
                <FieldGroup>

                    <Field>
                        <FieldLabel>Email</FieldLabel>
                        <Input
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange = {(e)=> setEmail(e.target.value)}
                        />
                        <FieldDescription>We'll never share your email.</FieldDescription>
                    </Field>

                    <Field>
                        <FieldLabel>Password</FieldLabel>
                        <Input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e)=> setPassword(e.target.value)}
                        />
                        {error && <FieldError>Incorrect email or password</FieldError>}
                    </Field>

                    <div className="flex gap-2">
                        <Button onClick={OnLogin}>Login</Button>
                        <Button onClick={OnSignup} variant="outline">Signup</Button>
                    </div>

                </FieldGroup>
            </FieldSet>
        </div>
    )
}