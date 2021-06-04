import styled from 'styled-components';
import { Link as RouterLink } from 'react-router-dom';

export const FooterContainer = styled.footer`background-color: #101522;`;

export const FooterWrapper = styled.div`
	padding: 48px 24px;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	max-width: 1100px;
	margin: 0 auto;
`;

export const FooterLinksContainer = styled.div`
	display: flex;
	justify-content: center;

	@media screen and (max-width: 820px) {
		padding-top: 16px;
	}
`;

export const FooterLinksWrapper = styled.div`
	display: flex;

	@media screen and (max-width: 820px) {
		flex-direction: column;
	}
`;

export const FooterLinkItems = styled.div`
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	margin: 16px;
	text-align: left;
	width: 160px;
	box-sizing: border-box;
	color: #fff;

	@media screen and (max-width: 420px) {
		margin: 0;
		padding: 10px;
		width: 100%;
	}
`;

export const FooterLinkTitle = styled.h1`
	font-size: 14px;
	margin-bottom: 16px;
`;

export const FooterRouterLink = styled(RouterLink)`
	color: #fff;
	text-decoration: none;
	margin-bottom: 0.5rem;
	font-size: 14px;

	&:hover {
		color: #01bf71;
		transition: 0.3s ease-out;
	}
`;

export const FooterLink = styled.a`
	color: #fff;
	text-decoration: none;
	margin-bottom: 0.5rem;
	font-size: 14px;

	&:hover {
		color: #01bf71;
		transition: 0.3s ease-out;
	}
`;

export const AdditionalInfo = styled.section`
	max-width: 1000px;
	width: 100%;
`;

export const AdditionalInfoWrapper = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	max-width: 1100px;
	margin: 40px auto 0 auto;

	@media screen and (max-width: 820px) {
		flex-direction: column;
	}
`;

export const AdditionalInfoLogo = styled(RouterLink)`
    color: #fff;
    justify-self: start;
    cursor: pointer;
    text-decoration: none;
    font-size: 1.5rem;
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    font-weight: bold;
`;

export const WebsiteRights = styled.small`
	color: #fff;
	margin-bottom: 16px;
`;

export const AdditionalInfoIcons = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	width: 240px;
`;

export const AdditionalInfoIconLink = styled.a`
	color: #fff;
	font-size: 24px;
`;
