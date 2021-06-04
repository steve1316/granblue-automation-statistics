import React from 'react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { animateScroll as scroll } from 'react-scroll';
import {
	FooterContainer,
	FooterWrapper,
	FooterLinksContainer,
	FooterLinksWrapper,
	FooterLinkItems,
	FooterLinkTitle,
	FooterRouterLink,
	FooterLink,
	AdditionalInfo,
	AdditionalInfoWrapper,
	AdditionalInfoLogo,
	WebsiteRights,
	AdditionalInfoIcons,
	AdditionalInfoIconLink
} from './FooterElements';

const Footer = () => {
	const toggleHome = () => {
		// Scroll to the top of the page when this is clicked.
		scroll.scrollToTop();
	};

	return (
		<FooterContainer>
			<FooterWrapper>
				<FooterLinksContainer>
					<FooterLinksWrapper>
						<FooterLinkItems>
							<FooterLinkTitle>About</FooterLinkTitle>
							<FooterRouterLink to="/about">How it works</FooterRouterLink>
						</FooterLinkItems>
					</FooterLinksWrapper>
					<FooterLinksWrapper>
						<FooterLinkItems>
							<FooterLinkTitle>Services</FooterLinkTitle>
							<FooterRouterLink to="/dashboard">Dashboard</FooterRouterLink>
							<FooterRouterLink to="/signup">Sign Up</FooterRouterLink>
							<FooterRouterLink to="/signin">Log In</FooterRouterLink>
						</FooterLinkItems>
					</FooterLinksWrapper>
					<FooterLinksWrapper>
						<FooterLinkItems>
							<FooterLinkTitle>Supported Apps</FooterLinkTitle>
							<FooterLink href="https://github.com/steve1316/granblue-automation-pyautogui" target="_blank" aria-label="Granblue Automation @ GitHub">
								Granblue Automation
							</FooterLink>
							<FooterLink href="https://github.com/steve1316/granblue-automation-android" target="_blank" aria-label="Granblue Automation Android @ GitHub">
								Granblue Automation Android
							</FooterLink>
						</FooterLinkItems>
					</FooterLinksWrapper>
				</FooterLinksContainer>
				<AdditionalInfo>
					<AdditionalInfoWrapper>
						<AdditionalInfoLogo to="/" onClick={toggleHome}>
							Granblue Automation Statistics
						</AdditionalInfoLogo>
						<WebsiteRights>steve1316 © {new Date().getFullYear()} All rights reserved.</WebsiteRights>
						<AdditionalInfoIcons>
							<AdditionalInfoIconLink href="https://github.com/steve1316" target="_blank" aria-label="GitHub">
								<FaGithub />
							</AdditionalInfoIconLink>
							<AdditionalInfoIconLink href="https://www.linkedin.com/in/steve-tu-370ba219b/" target="_blank" aria-label="LinkedIn">
								<FaLinkedin />
							</AdditionalInfoIconLink>
						</AdditionalInfoIcons>
					</AdditionalInfoWrapper>
				</AdditionalInfo>
			</FooterWrapper>
		</FooterContainer>
	);
};

export default Footer;
