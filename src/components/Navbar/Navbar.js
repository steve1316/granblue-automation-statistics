import { FaBars } from 'react-icons/fa';
import { Nav, NavbarContainer, MobileIcon, NavLogo, NavMenu, NavItem, NavLinks, NavButton, NavButtonLink } from './NavbarElements.js';

const Navbar = ({ toggle }) => {
	return (
		<Nav>
			<NavbarContainer>
				<NavLogo to="/">GA Statistics</NavLogo>
				<MobileIcon onClick={toggle}>
					<FaBars />
				</MobileIcon>
				<NavMenu>
					<NavItem>
						<NavLinks to="/dashboard">Dashboard</NavLinks>
					</NavItem>
					<NavItem>
						<NavLinks to="/signup">Sign Up</NavLinks>
					</NavItem>
				</NavMenu>
				<NavButton>
					<NavButtonLink to="/signin">Sign In</NavButtonLink>
				</NavButton>
			</NavbarContainer>
		</Nav>
	);
};

export default Navbar;
