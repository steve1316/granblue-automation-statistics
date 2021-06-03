import styled from 'styled-components';
import { Link as LinkRouter } from 'react-router-dom';
import { MdKeyboardArrowRight, MdArrowForward } from 'react-icons/md';

export const HeroContainer = styled.div`
	background: #0c0c0c;
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 0 30px;
	height: 800px;
	position: relative;
	z-index: 1;
`;

export const HeroBackground = styled.div`
	position: absolute;
	top: 0;
	right: 0;
	left: 0;
	bottom: 0;
	width: 100%;
	height: 100%;
	overflow: hidden;
`;

export const HeroVideo = styled.video`
	width: 100%;
	height: 100%;
	object-fit: cover;
	background: #232a34;
`;

export const HeroContent = styled.div`
	z-index: 3;
	max-width: 1200px;
	position: absolute;
	padding: 8px 24px;
	display: flex;
	flex-direction: column;
	align-items: center;
`;

export const HeroH1 = styled.h1`
	color: #fff;
	font-size: 48px;
	text-align: center;

	@media screen and (max-width: 768px) {
		font-size: 40px;
	}

	@media screen and (max-widthL: 480px) {
		font-size: 32px;
	}
`;

export const HeroP = styled.p`
	margin-top: 24px;
	color: #fff;
	font-size: 24px;
	text-align: center;
	max-width: 600px;

	@media screen and (max-width: 768px) {
		font-size: 24px;
	}

	@media screen and (max-widthL: 480px) {
		font-size: 18px;
	}
`;

export const HeroButtonWrapper = styled.div`
	margin-top: 32px;
	display: flex;
	flex-direction: row;
	align-items: center;
`;

export const HeroButton = styled(LinkRouter)`
    border-radius: 50px;
    background: #01bf71;
    padding: 16px 32px;
    color: #010606;
    font-size: 16px;
    outline: none;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    text-decoration: none;
	margin: 0 50px;

    &:hover {
        transition: all 0.2s ease-in-out;
        background: #fff;
        color: #010606;
    }
`;

export const ArrowForward = styled(MdArrowForward)`
    margin-left: 8px;
    font-size: 20px;
`;

export const ArrowRight = styled(MdKeyboardArrowRight)`
    margin-left: 8px;
    font-size: 20px;
`;
