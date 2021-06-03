import React from 'react';
import { InfoContainer, InfoSVGContainer, InfoWrapper, InfoRow, Column1, Column2, TextWrapper, TopLine, Heading, Subtitle, ImageWrapper, Image } from './InfoElements';

const InfoSection = ({ lightBg, id, imgStart, topLine, lightText, lightTextDesc, headLine, description, img, imgWidth, imgHeight, alt, svgPattern }) => {
	if (svgPattern) {
		return (
			<InfoSVGContainer lightBg={lightBg} svgPattern={svgPattern} id={id}>
				<InfoWrapper>
					<InfoRow imgStart={imgStart}>
						<Column1>
							<TextWrapper>
								<TopLine>{topLine}</TopLine>
								<Heading lightText={lightText}>{headLine}</Heading>
								<Subtitle lightTextDesc={lightTextDesc}>{description}</Subtitle>
							</TextWrapper>
						</Column1>
						<Column2>
							<ImageWrapper>
								<Image src={img} width={imgWidth} height={imgHeight} alt={alt} />
							</ImageWrapper>
						</Column2>
					</InfoRow>
				</InfoWrapper>
			</InfoSVGContainer>
		);
	} else {
		return (
			<InfoContainer lightBg={lightBg} id={id}>
				<InfoWrapper>
					<InfoRow imgStart={imgStart}>
						<Column1>
							<TextWrapper>
								<TopLine>{topLine}</TopLine>
								<Heading lightText={lightText}>{headLine}</Heading>
								<Subtitle lightTextDesc={lightTextDesc}>{description}</Subtitle>
							</TextWrapper>
						</Column1>
						<Column2>
							<ImageWrapper>
								<Image src={img} width={imgWidth} height={imgHeight} alt={alt} />
							</ImageWrapper>
						</Column2>
					</InfoRow>
				</InfoWrapper>
			</InfoContainer>
		);
	}
};

export default InfoSection;
