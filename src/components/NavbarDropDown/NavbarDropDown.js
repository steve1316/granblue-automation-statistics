import {
	NavbarDropDownContainer,
	NavbarDropDownIcon,
	CloseIcon,
	NavbarDropDownWrapper,
	NavbarDropDownMenu,
	NavbarDropDownLink,
	NavbarDropDownButtonWrapper,
	NavbarDropDownButtonLink
} from './NavbarDropDownElements';

const NavbarDropDown = ({ isOpen, toggle }) => {
	return (
		<NavbarDropDownContainer isOpen={isOpen} onClick={toggle}>
			<NavbarDropDownIcon onClick={toggle}>
				<CloseIcon />
			</NavbarDropDownIcon>
			<NavbarDropDownWrapper>
				<NavbarDropDownMenu>
					<NavbarDropDownLink to="/dashboard" onClick={toggle}>
						Dashboard
					</NavbarDropDownLink>
					<NavbarDropDownLink to="/signup" onClick={toggle}>
						Sign Up
					</NavbarDropDownLink>
				</NavbarDropDownMenu>
				<NavbarDropDownButtonWrapper>
					<NavbarDropDownButtonLink to="/signin">Sign In</NavbarDropDownButtonLink>
				</NavbarDropDownButtonWrapper>
			</NavbarDropDownWrapper>
		</NavbarDropDownContainer>
	);
};

export default NavbarDropDown;
