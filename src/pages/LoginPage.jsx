import { Field, FieldLabel, FieldSet, FieldGroup, FieldDescription, FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function LoginPage() {

    // use state acts as a trigger for each variable so when any have a change using the setVariable method, the page refreshes automatically
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState(false)

    // async for fetching call with headers and error handling
    async function OnLogin(e) {
        //rest api
    }
    function OnSignup(e) {
        //redirect
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
                            value={email}
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