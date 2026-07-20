import { IconButton, InputAdornment, TextField, TextFieldProps } from "@mui/material"
import { Visibility, VisibilityOff } from "@mui/icons-material"

/** Props for PasswordField. Extends the standard TextField props with the shared visibility-toggle state. */
type PasswordFieldProps = TextFieldProps & {
    /** Whether the password is currently shown as plain text. */
    showPassword: boolean
    /** Setter that toggles the shared password visibility state. */
    setShowPassword: (value: boolean) => void
}

/**
 * A password TextField with a built-in visibility-toggle end adornment. The visibility state is supplied by the parent so multiple fields can share a single toggle.
 *
 * @param showPassword Whether the password is currently shown as plain text.
 * @param setShowPassword Setter that toggles the shared password visibility state.
 * @param rest Any other TextField props (label, placeholder, onChange, onFocus, etc.) passed through to the underlying TextField.
 * @returns The rendered password TextField.
 */
const PasswordField = ({ showPassword, setShowPassword, ...rest }: PasswordFieldProps) => {
    return (
        <TextField
            {...rest}
            type={showPassword ? "text" : "password"}
            slotProps={{
                input: {
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton aria-label="toggle password visibility" onClick={() => setShowPassword(!showPassword)} onMouseDown={(e) => e.preventDefault()} edge="end">
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                    ),
                },
            }}
        />
    )
}

export default PasswordField
