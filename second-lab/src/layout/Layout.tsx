import { FC, PropsWithChildren } from 'react';

import { Footer, Header } from '@/components';

const Layout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
};

export { Layout };
