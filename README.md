# Podium 마이크로프론트엔드 데모

이 프로젝트는 [Podium](https://podium-lib.io/)을 사용한 마이크로프론트엔드 아키텍처 데모입니다. Next.js와 Express를 함께 사용하여 여러 개의 독립적인 프론트엔드 애플리케이션(Podlet)을 하나의 통합된 웹 페이지로 조합합니다.

## 프로젝트 구조

```
podium-microfrontend-demo/
├── layout/                # 레이아웃 애플리케이션 (Next.js)
│   ├── src/               # Next.js 소스 코드
│   ├── lib/               # 유틸리티 및 공통 함수
│   └── middleware.ts      # Podium 통합을 위한 미들웨어
│
├── podlets/               # 마이크로프론트엔드 컴포넌트들
│   ├── header-podlet/     # 헤더 컴포넌트
│   ├── content-podlet/    # 메인 콘텐츠 컴포넌트
│   └── footer-podlet/     # 푸터 컴포넌트
```

## 기술 스택

- **Podium**: 마이크로프론트엔드 프레임워크
- **Next.js**: 레이아웃 애플리케이션용 React 프레임워크
- **Express**: Podlet 서버용 Node.js 웹 프레임워크
- **TypeScript**: 정적 타입 지원
- **pnpm**: 패키지 관리자

## 설치 및 실행 방법

### 모든 의존성 설치

```bash
pnpm install:all
```

### 개발 모드로 실행

```bash
pnpm dev
```

이 명령어는 레이아웃 애플리케이션과 모든 Podlet을 동시에 개발 모드로 실행합니다.

### 프로덕션용 빌드

```bash
pnpm build:all
```

### 프로덕션 모드로 실행

```bash
pnpm start:all
```

## 주요 컴포넌트

### 레이아웃 애플리케이션 (Layout)

Next.js 기반의 애플리케이션으로, 여러 Podlet을 조합하여 완전한 웹 페이지를 구성합니다. `/layout` 디렉토리에 위치합니다.

### Podlet (마이크로프론트엔드)

독립적으로 개발, 배포, 실행되는 프론트엔드 컴포넌트입니다:

- **Header Podlet**: 페이지 상단의 네비게이션 바 (포트: 7100)
- **Content Podlet**: 페이지의 주요 콘텐츠 영역 (포트: 7200)
- **Footer Podlet**: 페이지 하단의 푸터 영역 (포트: 7300)

## 마이크로프론트엔드 아키텍처

이 프로젝트는 다음과 같은 마이크로프론트엔드 원칙을 따릅니다:

1. **독립적인 개발**: 각 팀이 자신의 Podlet을 독립적으로 개발할 수 있습니다.
2. **독립적인 배포**: 각 Podlet은 다른 Podlet에 영향을 주지 않고 개별적으로 배포할 수 있습니다.
3. **런타임 통합**: 모든 Podlet은 런타임에 레이아웃 애플리케이션에 의해 조합됩니다.
4. **기술 스택 자율성**: 각 Podlet은 필요에 따라 다른 기술 스택을 사용할 수 있습니다.

## 포트 구성

- **Layout**: 3000
- **Header Podlet**: 7100
- **Content Podlet**: 7200
- **Footer Podlet**: 7300
