import { FC, HTMLAttributes } from 'react';

import styles from './Footer.module.css';

type Props = HTMLAttributes<unknown>;

const Footer: FC<Props> = ({ ...rest }) => {
  return (
    <footer className={styles.footer} {...rest}>
      Footer
    </footer>
  );
};

export { Footer };
