import React, { useEffect, useState } from 'react';
import { FaBars } from 'react-icons/fa';
import { IconContext } from 'react-icons/lib';
import { animateScroll as scroll } from 'react-scroll';
import { Nav, NavbarContainer, MobileIcon, NavLogo, NavMenu, NavItem, NavLinks, NavButton, NavButtonLink } from './NavbarElements.js';

const Navbar = ({ toggle }) => {
	const [ scrollNav, setScrollNav ] = useState(false);

	useEffect(() => {
		window.addEventListener('scroll', changeNavBg);
	}, []);

	const changeNavBg = () => {
		// If user scrolls 240px down, change the background color of the Navbar.
		if (window.scrollY >= 240) {
			setScrollNav(true);
		} else {
			setScrollNav(false);
		}
	};

	const toggleHome = () => {
		// Scroll to the top of the page when this is clicked.
		scroll.scrollToTop();
	};

	return (
		// Provider changes the color of the hamburger icon.
		<IconContext.Provider value={{ color: 'red' }}>
			<Nav scrollNav={scrollNav}>
				<NavbarContainer>
					<NavLogo to="/" onClick={toggleHome}>
						GA Statistics
					</NavLogo>
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
		</IconContext.Provider>
	);
};

export default Navbar;
