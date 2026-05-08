import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Brain,
  Eye,
  EyeOff,
  UserPlus,
  User,
  Mail,
  Lock,
  Calendar,
  Phone,
  MapPin,
  Stethoscope,
  CreditCard,
} from "lucide-react";

const FIELD_CONFIG = [
  {
    id: "first_name",
    label: "First Name",
    type: "text",
    placeholder: "Jane",
    autoComplete: "given-name",
    icon: User,
    half: true,
  },
  {
    id: "last_name",
    label: "Last Name",
    type: "text",
    placeholder: "Doe",
    autoComplete: "family-name",
    icon: User,
    half: true,
  },
  {
    id: "cin",
    label: "CIN",
    type: "text",
    placeholder: "National ID number",
    autoComplete: "off",
    icon: CreditCard,
  },
  {
    id: "email",
    label: "Email Address",
    type: "email",
    placeholder: "you@example.com",
    autoComplete: "email",
    icon: Mail,
  },
  {
    id: "password",
    label: "Password",
    type: "password",
    placeholder: "••••••••",
    autoComplete: "new-password",
    icon: Lock,
    isPassword: true,
  },
  {
    id: "date_of_birth",
    label: "Date of Birth",
    type: "date",
    placeholder: "",
    autoComplete: "bday",
    icon: Calendar,
  },
  {
    id: "phone",
    label: "Phone",
    type: "tel",
    placeholder: "+216 XX XXX XXX",
    autoComplete: "tel",
    icon: Phone,
  },
  {
    id: "address",
    label: "Address",
    type: "text",
    placeholder: "123 Main St, City",
    autoComplete: "street-address",
    icon: MapPin,
  },
  {
    id: "specialization",
    label: "Specialization",
    type: "text",
    placeholder: "e.g. Cognitive Behavioral Therapy",
    autoComplete: "off",
    icon: Stethoscope,
  },
];

export default function SignupPage() {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    cin: "",
    email: "",
    password: "",
    date_of_birth: "",
    phone: "",
    address: "",
    specialization: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function validate() {
    const newErrors = {};
    if (!form.first_name.trim()) newErrors.first_name = "Required";
    if (!form.last_name.trim()) newErrors.last_name = "Required";
    if (!form.cin.trim()) newErrors.cin = "Required";
    if (!form.email.trim()) newErrors.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = "Invalid email";
    if (!form.password) newErrors.password = "Required";
    else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(form.password))
      newErrors.password = "Password must contain at least 8 characters, 1 uppercase letter, 1 number, and 1 special character.";
    if (!form.date_of_birth) newErrors.date_of_birth = "Required";
    if (!form.phone.trim()) newErrors.phone = "Required";
    else if (!/^[0-9]{8}$/.test(form.phone)) newErrors = "Invalid number"
    if (!form.address.trim()) newErrors.address = "Required";
    if (!form.specialization.trim()) newErrors.specialization = "Required";
    return newErrors;
  }

  async function handleSignup() {
    setGlobalError(null);
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/psychiatrist_signup`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setGlobalError(data.message || "Registration failed. Please try again.");
      } else {
        navigate("/login");
      }
    } catch {
      setGlobalError("Could not reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(id, value) {
    setForm((prev) => ({ ...prev, [id]: value }));
    setErrors((prev) => ({ ...prev, [id]: undefined }));
    setGlobalError(null);
  }

  // half width fields in pairs
  const rows = [];
  let i = 0;
  while (i < FIELD_CONFIG.length) {
    const field = FIELD_CONFIG[i];
    if (field.half && FIELD_CONFIG[i + 1]?.half) {
      rows.push([field, FIELD_CONFIG[i + 1]]);
      i += 2;
    } else {
      rows.push([field]);
      i += 1;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-slate-50 flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-lg">

        {/* Logo + title */}
        <div className="flex flex-col items-center mb-8 gap-3">
          <div className="h-14 w-14 rounded-2xl bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-200">
            <Brain className="h-7 w-7 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight">PsyHome</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Create your clinical account
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border shadow-sm shadow-slate-100 p-6 space-y-4">

          {rows.map((row, rowIdx) => (
            <div
              key={rowIdx}
              className={row.length === 2 ? "grid grid-cols-2 gap-3" : ""}
            >
              {row.map((field) => (
                <FieldItem
                  key={field.id}
                  field={field}
                  value={form[field.id]}
                  error={errors[field.id]}
                  showPass={showPass}
                  onTogglePass={() => setShowPass((v) => !v)}
                  onChange={(val) => handleChange(field.id, val)}
                  onEnter={handleSignup}
                />
              ))}
            </div>
          ))}

          {/* Global error */}
          {globalError && (
            <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2">
              <p className="text-sm text-red-600">{globalError}</p>
            </div>
          )}

          {/* Submit */}
          <Button
            className="w-full gap-2 mt-2"
            onClick={handleSignup}
            disabled={loading}
          >
            {loading ? (
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                />
              </svg>
            ) : (
              <UserPlus className="h-4 w-4" />
            )}
            {loading ? "Creating account…" : "Create account"}
          </Button>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-violet-600 hover:underline font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

/* ── Field sub-component ── */
function FieldItem({ field, value, error, showPass, onTogglePass, onChange, onEnter }) {
  const Icon = field.icon;
  const inputType =
    field.isPassword ? (showPass ? "text" : "password") : field.type;

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-violet-500" />
        {field.label}
      </label>
      <div className="relative">
        <Input
          type={inputType}
          placeholder={field.placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onEnter()}
          autoComplete={field.autoComplete}
          className={`${field.isPassword ? "pr-10" : ""} ${
            error ? "border-red-400 focus-visible:ring-red-300" : ""
          }`}
        />
        {field.isPassword && (
          <button
            type="button"
            onClick={onTogglePass}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPass ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}